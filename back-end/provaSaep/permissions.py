from rest_framework.permissions import BasePermission

#Nessa permissions verifica se o usuario que pode ter acesso as infomeções ele foi criado pelo createsuperuser e se ele é autenticado 
# entao ele precisa ter o token de acesso se for verdadeiro ele tem permição se nao não aparece o token 

class IsAdmin(BasePermission):

    def has_permission(self, request, view):
        if request.user.is_authenticated and request.user.is_superuser:
            return True
        return False
    
    