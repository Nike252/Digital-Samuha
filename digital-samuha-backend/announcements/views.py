from rest_framework import generics, permissions, status
from rest_framework.response import Response

from samuha.models import Membership

from .models import Announcement
from .serializers import AnnouncementCreateSerializer, AnnouncementSerializer


class IsAdhakshyaOrCoAdhakshya(permissions.BasePermission):
    """
    Custom permission: Only Adhakshya or Co-Adhakshya can create/update/delete announcements.
    """

    def has_permission(self, request, view):
        # Must be authenticated
        if not request.user or not request.user.is_authenticated:
            return False

        # For safe methods (GET, HEAD, OPTIONS), allow all authenticated users
        if request.method in permissions.SAFE_METHODS:
            return True

        # For write methods, check if user is Adhakshya or Co-Adhakshya in any Samuha
        membership = Membership.objects.filter(
            user=request.user,
            role__in=[Membership.ROLE_ADHAKSHYA, Membership.ROLE_CO_ADHAKSHYA],
            is_approved=True,
        ).first()

        return membership is not None

    def has_object_permission(self, request, view, obj):
        # Allow all authenticated users to read
        if request.method in permissions.SAFE_METHODS:
            return True

        # Only creator or Adhakshya of the same Samuha can update/delete
        if obj.created_by == request.user:
            return True

        # Check if user is Adhakshya of the same Samuha
        membership = Membership.objects.filter(
            user=request.user,
            samuha=obj.samuha,
            role=Membership.ROLE_ADHAKSHYA,
            is_approved=True,
        ).first()

        return membership is not None


class AnnouncementListCreateView(generics.ListCreateAPIView):
    """
    GET: List all announcements for user's Samuha (all members can view)
    POST: Create new announcement (Adhakshya/Co-Adhakshya only)
    """

    permission_classes = [permissions.IsAuthenticated, IsAdhakshyaOrCoAdhakshya]
    serializer_class = AnnouncementSerializer

    def get_queryset(self):
        """
        Return announcements for the user's Samuha.
        Filter by date range and active status.
        Adhakshya/Co-Adhakshya can see all (including expired).
        Members only see currently visible announcements.
        """
        from django.utils import timezone
        from django.db.models import Q
        
        user = self.request.user
        today = timezone.now().date()

        # Get user's memberships
        user_samuhas = Membership.objects.filter(user=user, is_approved=True).values_list(
            "samuha_id", flat=True
        )

        # Check if user is admin
        is_admin = Membership.objects.filter(
            user=user,
            role__in=[Membership.ROLE_ADHAKSHYA, Membership.ROLE_CO_ADHAKSHYA],
            is_approved=True,
        ).exists()

        # Base query: announcements from user's Samuhas
        queryset = Announcement.objects.filter(samuha_id__in=user_samuhas)

        # Members only see active announcements within date range
        if not is_admin:
            queryset = queryset.filter(
                is_active=True,
            ).filter(
                Q(display_from__isnull=True) | Q(display_from__lte=today)
            ).filter(
                Q(display_until__isnull=True) | Q(display_until__gte=today)
            )

        return queryset.select_related("samuha", "created_by")

    def get_serializer_class(self):
        """Use different serializer for create"""
        if self.request.method == "POST":
            return AnnouncementCreateSerializer
        return AnnouncementSerializer

    def perform_create(self, serializer):
        """
        Automatically set created_by and samuha when creating announcement.
        Uses the user's primary Samuha membership.
        """
        user = self.request.user

        # Get user's Adhakshya/Co-Adhakshya membership
        membership = Membership.objects.filter(
            user=user,
            role__in=[Membership.ROLE_ADHAKSHYA, Membership.ROLE_CO_ADHAKSHYA],
            is_approved=True,
        ).first()

        if not membership:
            return Response(
                {"error": "You must be Adhakshya or Co-Adhakshya to create announcements."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer.save(created_by=user, samuha=membership.samuha)


class AnnouncementDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET: Retrieve single announcement
    PATCH/PUT: Update announcement (creator or Adhakshya only)
    DELETE: Delete announcement (creator or Adhakshya only)
    """

    permission_classes = [permissions.IsAuthenticated, IsAdhakshyaOrCoAdhakshya]
    queryset = Announcement.objects.all()

    def get_serializer_class(self):
        """Use different serializer for update"""
        if self.request.method in ["PUT", "PATCH"]:
            return AnnouncementCreateSerializer
        return AnnouncementSerializer

    def get_queryset(self):
        """Only allow access to announcements from user's Samuha"""
        user = self.request.user
        user_samuhas = Membership.objects.filter(user=user, is_approved=True).values_list(
            "samuha_id", flat=True
        )
        return Announcement.objects.filter(samuha_id__in=user_samuhas).select_related(
            "samuha", "created_by"
        )
