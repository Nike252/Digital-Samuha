from django.contrib.auth import authenticate, get_user_model
from rest_framework import serializers

from samuha.models import Membership, Samuha

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()
    samuha = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ("id", "phone", "first_name", "last_name", "full_name", "email", "role", "samuha")

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip() or obj.phone

    def get_role(self, obj):
        membership = obj.memberships.filter(status=Membership.STATUS_ACTIVE).first()
        return membership.role if membership else "member"

    def get_samuha(self, obj):
        membership = obj.memberships.filter(status=Membership.STATUS_ACTIVE).first()
        if membership:
            return {
                "id": membership.samuha.id,
                "name": membership.samuha.samuha_name,
                "is_premium": membership.samuha.is_premium,
                "code": membership.samuha.samuha_code
            }
        return None


class RegisterSerializer(serializers.ModelSerializer):
    """
    Basic user registration (without Samuha linking).
    """

    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ("phone", "password", "confirm_password", "first_name", "last_name", "email")

    def validate(self, attrs):
        if attrs["password"] != attrs["confirm_password"]:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        password = validated_data.pop("password")
        validated_data.pop("confirm_password", None)
        user = User.objects.create_user(password=password, **validated_data)
        return user


class SignUpSerializer(serializers.Serializer):
    """
    User signup with Samuha code.
    Creates User account + Membership linking to Samuha.
    User must login separately after signup.
    """

    phone = serializers.CharField(required=True)
    first_name = serializers.CharField(required=True, max_length=150)
    last_name = serializers.CharField(required=True, max_length=150)
    email = serializers.EmailField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, required=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True, required=True, min_length=8)
    role = serializers.ChoiceField(
        choices=Membership.ROLE_CHOICES,
        required=True,
        help_text="Role: adhakshya, co_adhakshya, or member",
    )
    samuha_code = serializers.CharField(required=True, max_length=32)

    def validate(self, attrs):
        # Check passwords match
        if attrs["password"] != attrs["confirm_password"]:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})

        # Handle empty email - convert to None
        email = attrs.get("email", "")
        if email == "":
            attrs["email"] = None

        # Check Samuha exists
        samuha_code = attrs.get("samuha_code")
        try:
            samuha = Samuha.objects.get(samuha_code=samuha_code)
        except Samuha.DoesNotExist:
            raise serializers.ValidationError({"samuha_code": "Invalid Samuha code."})

        # Check if Samuha is active (approved by admin)
        if samuha.status != Samuha.STATUS_ACTIVE:
            if samuha.status == Samuha.STATUS_PENDING:
                raise serializers.ValidationError({
                    "samuha_code": "This Samuha is pending approval. Please wait for admin approval before signing up."
                })
            elif samuha.status == Samuha.STATUS_INACTIVE:
                raise serializers.ValidationError({
                    "samuha_code": "This Samuha is inactive. Please contact the administrator."
                })
            else:
                raise serializers.ValidationError({
                    "samuha_code": "This Samuha is not available for signup. Please contact the administrator."
                })

        attrs["samuha"] = samuha

        # Check if user already exists
        phone = attrs.get("phone")
        if User.objects.filter(phone=phone).exists():
            raise serializers.ValidationError({"phone": "A user with this phone number already exists."})

        return attrs

    def create(self, validated_data):
        samuha = validated_data.pop("samuha")
        password = validated_data.pop("password")
        validated_data.pop("confirm_password")
        validated_data.pop("samuha_code")  # Remove samuha_code - not a User field
        role = validated_data.pop("role")

        # Create User account
        user = User.objects.create_user(password=password, **validated_data)

        # Auto-approve Adhakshya and Co-Adhakshya, Members need approval
        is_approved = role in [Membership.ROLE_ADHAKSHYA, Membership.ROLE_CO_ADHAKSHYA]

        # Create Membership linking User to Samuha
        membership = Membership.objects.create(
            user=user,
            samuha=samuha,
            role=role,
            is_approved=is_approved,
        )

        return {
            "user": user,
            "membership": membership,
        }


class LoginSerializer(serializers.Serializer):
    phone = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        phone = attrs.get("phone")
        password = attrs.get("password")

        if phone and password:
            user = authenticate(request=self.context.get("request"), phone=phone, password=password)
            if not user:
                raise serializers.ValidationError("Invalid phone or password.", code="authorization")
        else:
            raise serializers.ValidationError("Both phone and password are required.", code="authorization")

        attrs["user"] = user
        return attrs


class ProfileUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating user profile information.
    """
    current_password = serializers.CharField(write_only=True, required=False)
    new_password = serializers.CharField(write_only=True, required=False, min_length=8)
    confirm_new_password = serializers.CharField(write_only=True, required=False, min_length=8)

    class Meta:
        model = User
        fields = ("phone", "first_name", "last_name", "email", "current_password", "new_password", "confirm_new_password")

    def validate_current_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value

    def validate_phone(self, value):
        user = self.context["request"].user
        # Check if phone is already taken by another user
        if User.objects.filter(phone=value).exclude(pk=user.pk).exists():
            raise serializers.ValidationError("A user with this phone number already exists.")
        return value

    def validate(self, attrs):
        # If changing password, ensure current password is provided
        if attrs.get("new_password") or attrs.get("confirm_new_password"):
            if not attrs.get("current_password"):
                raise serializers.ValidationError({
                    "current_password": "Current password is required to change password."
                })
            
            # Check if new passwords match
            if attrs.get("new_password") != attrs.get("confirm_new_password"):
                raise serializers.ValidationError({
                    "confirm_new_password": "New passwords do not match."
                })
        
        # If only changing phone, still need current password
        if attrs.get("phone") and attrs.get("phone") != self.context["request"].user.phone:
            if not attrs.get("current_password"):
                raise serializers.ValidationError({
                    "current_password": "Current password is required to change phone number."
                })

        return attrs

    def update(self, instance, validated_data):
        # Update phone if provided and different
        phone = validated_data.pop("phone", None)
        if phone and phone != instance.phone:
            instance.phone = phone

        # Update other fields
        instance.first_name = validated_data.get("first_name", instance.first_name)
        instance.last_name = validated_data.get("last_name", instance.last_name)
        instance.email = validated_data.get("email", instance.email)

        # Update password if provided
        new_password = validated_data.pop("new_password", None)
        if new_password:
            instance.set_password(new_password)

        instance.save()
        return instance