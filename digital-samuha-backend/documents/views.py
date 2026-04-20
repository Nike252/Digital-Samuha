from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from django.http import HttpResponse
import io
from .models import Document
from .serializers import DocumentSerializer
from samuha.models import Membership, Samuha
from attendance.models import Meeting
from ledger.models import Transaction
from django.db.models import Sum, Count, Q
from django.db import models
from rest_framework.views import APIView

class DocumentViewSet(viewsets.ModelViewSet):
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        membership = Membership.objects.filter(user=user, status=Membership.STATUS_ACTIVE).first()
        if not membership:
            return Document.objects.none()
        return Document.objects.filter(samuha=membership.samuha).order_by('-created_at')

    def perform_create(self, serializer):
        user = self.request.user
        membership = Membership.objects.filter(user=user, status=Membership.STATUS_ACTIVE).first()
        if membership:
            serializer.save(samuha=membership.samuha, uploaded_by=user)

    @action(detail=False, methods=['get'], url_path='latest-payout')
    def latest_payout(self, request):
        user = request.user
        membership = Membership.objects.filter(user=user, status=Membership.STATUS_ACTIVE).first()
        if not membership:
            return Response({"detail": "Active membership required."}, status=403)
        
        doc = Document.objects.filter(samuha=membership.samuha, category='payout').order_by('-created_at').first()
        if not doc:
            return Response({"detail": "No distribution reports found."}, status=404)
            
        return Response(DocumentSerializer(doc).data)

    def destroy(self, request, *args, **kwargs):
        user = request.user
        membership = Membership.objects.filter(user=user, status=Membership.STATUS_ACTIVE).first()
        if not membership or membership.role not in [Membership.ROLE_ADHAKSHYA, Membership.ROLE_CO_ADHAKSHYA]:
            return Response({"detail": "Only Adhakshya or Co-Adhakshya can delete documents."}, 
                            status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)

class MeetingRecordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, meeting_id):
        meeting = get_object_or_404(Meeting, id=meeting_id)
        
        # Verify user belongs to same Samuha
        membership = Membership.objects.filter(user=request.user, samuha=meeting.samuha, status=Membership.STATUS_ACTIVE).first()
        if not membership:
            return Response({"detail": "Access denied."}, status=status.HTTP_403_FORBIDDEN)

        # Aggregate Attendance Stats
        attendance_stats = meeting.attendance_records.aggregate(
            present_count=Count('id', filter=Q(status='present')),
            absent_count=Count('id', filter=Q(status='absent')),
            late_count=Count('id', filter=Q(status='late')),
            total_fines=Sum('fine_amount')
        )

        # Aggregate Financial transactions from this meeting
        transactions = Transaction.objects.filter(meeting=meeting)
        financial_summary = transactions.aggregate(
            total_savings=Sum('amount', filter=Q(type=Transaction.TYPE_SAVING)),
            total_loans_disbursed=Sum('amount', filter=Q(type=Transaction.TYPE_LOAN_DISBURSEMENT)),
            total_repayments=Sum('amount', filter=Q(type=Transaction.TYPE_LOAN_REPAYMENT)),
            total_interest_collected=Sum('amount', filter=Q(type=Transaction.TYPE_INTEREST))
        )

        # Get detailed member-wise data for the "sheet" view
        members_data = []
        memberships = Membership.objects.filter(samuha=meeting.samuha, status=Membership.STATUS_ACTIVE).select_related('user')
        
        # Get all attendance records for this meeting
        attendance_map = {a.user_id: a for a in meeting.attendance_records.all()}
        
        # Get all transactions for this meeting, grouped by user and type
        user_transactions = Transaction.objects.filter(meeting=meeting).values('user_id', 'type').annotate(total=Sum('amount'))
        
        # Build a lookup for transactions: {user_id: {type: amount}}
        trans_lookup = {}
        for ut in user_transactions:
            uid = ut['user_id']
            if uid is None: continue
            if uid not in trans_lookup:
                trans_lookup[uid] = {}
            trans_lookup[uid][ut['type']] = float(ut['total'] or 0)

        for m in memberships:
            att = attendance_map.get(m.user.id)
            user_trans = trans_lookup.get(m.user.id, {})
            
            members_data.append({
                "name": m.user.full_name,
                "phone": m.user.phone,
                "status": str(att.status) if att else "N/A",
                "savings": float(user_trans.get(Transaction.TYPE_SAVING, 0)),
                "interest": float(user_trans.get(Transaction.TYPE_INTEREST, 0)),
                "repayment": float(user_trans.get(Transaction.TYPE_LOAN_REPAYMENT, 0)),
                "fine": float(att.fine_amount or 0) if att else 0,
            })

        # Build full report
        report = {
            "meeting_details": {
                "id": meeting.id,
                "title": str(meeting.title),
                "date": meeting.date.isoformat() if meeting.date else "",
                "description": str(meeting.description or ""),
            },
            "samuha_details": {
                "name": str(meeting.samuha.samuha_name),
                "address": f"{meeting.samuha.province}, {meeting.samuha.district}, {meeting.samuha.municipality}-W{meeting.samuha.ward_number}",
                "adhakshya": str(meeting.samuha.adhakshya_full_name),
            },
            "attendance": {
                "present": int(attendance_stats['present_count'] or 0),
                "absent": int(attendance_stats['absent_count'] or 0),
                "late": int(attendance_stats['late_count'] or 0),
                "fines_collected": float(attendance_stats['total_fines'] or 0),
            },
            "financials": {
                "savings": float(financial_summary['total_savings'] or 0),
                "loans_disbursed": float(financial_summary['total_loans_disbursed'] or 0),
                "repayments": float(financial_summary['total_repayments'] or 0),
                "interest": float(financial_summary['total_interest_collected'] or 0),
            },
            "members_data": members_data
        }

        return Response(report)

class WardNiwedanView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        membership = Membership.objects.filter(user=user, role=Membership.ROLE_ADHAKSHYA, status=Membership.STATUS_ACTIVE).first()
        
        if not membership:
            return Response({"detail": "Only the Adhakshya can request official Ward Niwedan documents."}, 
                            status=status.HTTP_403_FORBIDDEN)
        
        samuha = membership.samuha
        
        # UT-20: Check for Citizenship No
        if not samuha.adhakshya_citizenship_no:
            return Response({
                "detail": "Citizenship Number is missing in your Samuha profile. Please update it before generating official documents."
            }, status=status.HTTP_400_BAD_REQUEST)

        from reportlab.lib.pagesizes import letter
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
        from reportlab.lib.styles import getSampleStyleSheet
        import io
        
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        styles = getSampleStyleSheet()
        elements = []

        elements.append(Paragraph("Ward Niwedan - Digital Samuha", styles['Title']))
        elements.append(Spacer(1, 12))
        elements.append(Paragraph(f"Official request from {samuha.samuha_name}", styles['Normal']))
        elements.append(Paragraph(f"Adhakshya: {samuha.adhakshya_full_name}", styles['Normal']))
        elements.append(Paragraph(f"Citizenship No: {samuha.adhakshya_citizenship_no}", styles['Normal']))
        
        doc.build(elements)
        pdf_content = buffer.getvalue()
        buffer.close()
        
        response = HttpResponse(pdf_content, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="Ward_Niwedan_{samuha.samuha_code}.pdf"'
        return response


