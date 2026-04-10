from rest_framework import permissions, status, serializers
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import LoginSerializer, RegisterSerializer, SignUpSerializer, ProfileUpdateSerializer


class RegisterView(APIView):
    """
    Basic user registration (without Samuha).
    """

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {
                "id": user.id,
                "phone": user.phone,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email,
            },
            status=status.HTTP_201_CREATED,
        )


class SignUpView(APIView):
    """
    User signup with Samuha code.
    Creates User + Membership. User must login separately after signup.
    """

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        try:
            serializer = SignUpSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            result = serializer.save()

            # Ensure result is a dictionary
            if not isinstance(result, dict):
                return Response(
                    {"error": "Unexpected error during signup.", "details": f"Result type: {type(result)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

            user = result.get("user")
            membership = result.get("membership")

            if not user or not membership:
                return Response(
                    {"error": "Failed to create user or membership."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

        except serializers.ValidationError as e:
            return Response({"error": e.detail}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            import traceback
            return Response(
                {
                    "error": str(e),
                    "type": type(e).__name__,
                    "traceback": traceback.format_exc(),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response(
            {
                "user": {
                    "id": user.id,
                    "phone": user.phone,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "email": user.email,
                },
                "membership": {
                    "id": membership.id,
                    "role": membership.role,
                    "role_display": membership.get_role_display(),
                    "is_approved": membership.is_approved,
                    "samuha": {
                        "id": membership.samuha.id,
                        "name": membership.samuha.samuha_name,
                        "code": membership.samuha.samuha_code,
                    },
                },
                "message": "Account created successfully. Please login to continue.",
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={"request": request})
        try:
            serializer.is_valid(raise_exception=True)
        except:
            return Response({"detail": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED)
        
        user = serializer.validated_data["user"]

        # Block superusers from regular login — they must use /sudo-login/
        if user.is_superuser:
            return Response(
                {"detail": "Invalid credentials."}, 
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Block login if user's Samuha is inactive
        from samuha.models import Membership, Samuha
        membership = Membership.objects.filter(user=user, is_approved=True).select_related('samuha').first()
        if membership and membership.samuha.status == Samuha.STATUS_INACTIVE:
            return Response(
                {"detail": "Your Samuha has been deactivated by the administrator. Please contact the admin."},
                status=status.HTTP_403_FORBIDDEN
            )

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            },
            status=status.HTTP_200_OK,
        )


class SuperAdminLoginView(APIView):
    """Separate login endpoint for superadmin only — used by /sudo page."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]

        if not user.is_superuser:
            return Response(
                {"detail": "Access denied."}, 
                status=status.HTTP_403_FORBIDDEN
            )

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            },
            status=status.HTTP_200_OK,
        )


class CurrentUserView(APIView):
    """
    Get current authenticated user's information including their role.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        
        # Get user's memberships (they can have multiple)
        from samuha.models import Membership, Samuha
        memberships = Membership.objects.filter(user=user, is_approved=True)
        
        # Get primary membership (first approved one, or first one if none approved)
        primary_membership = memberships.first()
        if not primary_membership:
            # Fallback to any membership
            primary_membership = Membership.objects.filter(user=user).first()
        
        response_data = {
            "id": user.id,
            "phone": user.phone,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "full_name": f"{user.first_name} {user.last_name}".strip() or user.phone,
            "is_superuser": user.is_superuser,
            "is_staff": user.is_staff,
        }
        
        # Add membership info if exists
        if primary_membership:
            samuha = primary_membership.samuha
            response_data["role"] = primary_membership.role
            response_data["role_display"] = primary_membership.get_role_display()
            response_data["samuha"] = {
                "id": samuha.id,
                "name": samuha.samuha_name,
                "code": samuha.samuha_code,
                "status": samuha.status,
            }
            response_data["is_approved"] = primary_membership.is_approved

            # If the Samuha is inactive, inform the frontend
            if samuha.status == Samuha.STATUS_INACTIVE:
                response_data["samuha_inactive"] = True
                response_data["samuha_inactive_message"] = "Your Samuha has been deactivated by the administrator."
        else:
            response_data["role"] = None
            response_data["role_display"] = None
            response_data["samuha"] = None
            response_data["is_approved"] = False
        
        return Response(response_data, status=status.HTTP_200_OK)

    def put(self, request):
        """
        Update user profile information
        """
        user = request.user
        serializer = ProfileUpdateSerializer(user, data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        updated_user = serializer.save()
        
        # Return updated user info
        response_data = {
            "id": updated_user.id,
            "phone": updated_user.phone,
            "first_name": updated_user.first_name,
            "last_name": updated_user.last_name,
            "email": updated_user.email,
            "full_name": f"{updated_user.first_name} {updated_user.last_name}".strip() or updated_user.phone,
            "is_superuser": updated_user.is_superuser,
            "is_staff": updated_user.is_staff,
        }
        
        # Include membership info as well
        from samuha.models import Membership
        primary_membership = Membership.objects.filter(user=updated_user, is_approved=True).first()
        if primary_membership:
            response_data["role"] = primary_membership.role
            response_data["role_display"] = primary_membership.get_role_display()
            response_data["samuha"] = {
                "id": primary_membership.samuha.id,
                "name": primary_membership.samuha.samuha_name,
                "code": primary_membership.samuha.samuha_code,
            }
            response_data["is_approved"] = primary_membership.is_approved
        else:
            response_data["role"] = None
            response_data["role_display"] = None
            response_data["samuha"] = None
            response_data["is_approved"] = False
            
        return Response(response_data, status=status.HTTP_200_OK)