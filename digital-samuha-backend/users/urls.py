from django.urls import path

from .views import CurrentUserView, LoginView, RegisterView, SignUpView, SuperAdminLoginView


urlpatterns = [
    path("register/", RegisterView.as_view(), name="auth-register"),
    path("signup/", SignUpView.as_view(), name="auth-signup"),
    path("login/", LoginView.as_view(), name="auth-login"),
    path("sudo-login/", SuperAdminLoginView.as_view(), name="auth-sudo-login"),
    path("me/", CurrentUserView.as_view(), name="auth-me"),
]