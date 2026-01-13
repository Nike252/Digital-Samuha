# Modernized AI Utils using google-genai 🏙️🤖
from django.conf import settings
from datetime import datetime
from django.db.models import Sum
from samuha.models import Membership, Samuha
from ledger.models import Transaction, Loan
from attendance.models import Meeting, Attendance

def get_samuha_context(samuha, membership=None):
    """
    Gather financial and rule-based context for a specific Samuha to prime the AI.
    If membership is provided, adds personal context for the user.
    """
    members_count = Membership.objects.filter(samuha=samuha, status=Membership.STATUS_ACTIVE).count()
    loans_active = Loan.objects.filter(samuha=samuha, status=Loan.STATUS_ACTIVE).count()
    total_savings = Transaction.objects.filter(samuha=samuha, type='saving').aggregate(Sum('amount'))['amount__sum'] or 0
    
    personal_context = ""
    if membership:
        days_since_joined = (datetime.now().date() - membership.joined_at.date()).days
        personal_context = f"""
        MEMBER PROFILE (The person you are talking to):
        - Name: {membership.user.first_name} {membership.user.last_name}
        - Role: {membership.get_role_display()}
        - Joined On: {membership.joined_at}
        - Days in Samuha: {days_since_joined} days
        """

    schedule_type = samuha.meeting_schedule_type
    if schedule_type == 'fixed_date':
        meeting_info = f"Every month on the {samuha.meeting_day_numeric}th day"
    elif schedule_type == 'weekly':
        meeting_info = f"Every week on {samuha.meeting_day}"
    elif schedule_type == 'relative_weekday':
        week_num = samuha.meeting_week_offset
        suffixes = {1: '1st', 2: '2nd', 3: '3rd', 4: '4th', 5: '5th'}
        week_str = suffixes.get(week_num, f"{week_num}th") if week_num else "Specific"
        meeting_info = f"The {week_str} {samuha.meeting_day} of every month"
    else:
        meeting_info = f"{samuha.get_meeting_schedule_type_display()} on {samuha.meeting_day}"

    context = f"""
    You are 'Samuha Bot', the official AI Assistant for the Samuha group: {samuha.samuha_name}.
    Today's Date is: {datetime.now().strftime('%B %d, %Y')}
    
    {personal_context}

    SAMUHA RULES:
    - Absent Fine: NPR {samuha.absent_fine}
    - Late Fine: NPR {samuha.late_fine}
    - Loan Interest Rate: {samuha.loan_interest_rate}% monthly
    - Exact Meeting Schedule: {meeting_info}
    
    CURRENT STATS (Group Data):
    - Total Members: {members_count}
    - Active Loans: {loans_active}
    - Total Group Savings: NPR {total_savings}
    
    INSTRUCTIONS:
    - Answer questions accurately using the rules, stats, and profile above.
    - Be professional, helpful, and community-oriented.
    - You support both English and Nepali. Respond in the language the user asks in.
    - If asked about personal history (like 'when did I join' or 'how many days'), use the MEMBER PROFILE above.
    """
    return context

def ask_samuha_ai(prompt, samuha_context):
    """
    Send prompt to Gemini with Samuha context.
    """
    api_key = getattr(settings, 'GEMINI_API_KEY', None)
    if not api_key:
        return "AI Error: Gemini API Key not configured."

    try:
        from google import genai
        # Force v1 API version to avoid v1beta 404 errors
        client = genai.Client(api_key=api_key, http_options={'api_version': 'v1'})
        
        # Your specific environment uses futuristic model versions (2.0, 2.5) 🚀
        model_names = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-pro']
        
        last_error = None
        for m_name in model_names:
            try:
                # Combine context and prompt
                full_prompt = f"{samuha_context}\n\nUser Question: {prompt}"
                response = client.models.generate_content(
                    model=m_name,
                    contents=full_prompt
                )
                return response.text
            except Exception as e:
                last_error = e
                continue
        
        # If all fail, raise the last one
        raise last_error
        
    except Exception as e:
        import traceback
        with open('ai_debug.log', 'a') as f:
            f.write(f"\n--- GEMINI AI ERROR {datetime.now()} ---\n")
            traceback.print_exc(file=f)
        return "I'm having trouble connecting to my brain right now. Please try again in a moment."
