from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (LoginView,UsuarioListCreateView,UsuarioDetailView,
EstoqueListCreateView,EstoqueDetailView,EstoqueEntradaView,EstoqueSaidaView,
HistoricoListView,HistoricoDetailView,
)

urlpatterns = [
    # Autenticação JWT (usa superuser do Django)
    path('api/login/', LoginView.as_view(), name='login'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Usuarios (tabela Usuario - CRUD)
    path('api/usuarios/', UsuarioListCreateView.as_view(), name='usuario-list-create'),
    path('api/usuarios/<int:pk>/', UsuarioDetailView.as_view(), name='usuario-detail'),
    
    # Estoque
    path('api/estoque/', EstoqueListCreateView.as_view(), name='estoque-list-create'),
    path('api/estoque/<int:pk>/', EstoqueDetailView.as_view(), name='estoque-detail'),
    path('api/estoque/<int:pk>/entrada/', EstoqueEntradaView.as_view(), name='estoque-entrada'),
    path('api/estoque/<int:pk>/saida/', EstoqueSaidaView.as_view(), name='estoque-saida'),
    
    # Historico (somente leitura)
    path('api/historico/', HistoricoListView.as_view(), name='historico-list'),
    path('api/historico/<int:pk>/', HistoricoDetailView.as_view(), name='historico-detail'),
]