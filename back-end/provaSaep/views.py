from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView, ListAPIView, RetrieveAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.views import TokenObtainPairView
from django.shortcuts import get_object_or_404
from .models import Usuario, Estoque, Historico
from .serializers import (
    LoginSerializer,
    UsuarioSerializer,
    EstoqueSerializer,
    HistoricoSerializer,
    EntradaSaidaSerializer
)


# ==================== LOGIN VIEW ====================

class LoginView(TokenObtainPairView):
    """
    POST /api/login/
    Body: {"username": "admin", "password": "senha"}
    Login com superuser do Django
    """
    serializer_class = LoginSerializer


# ==================== USUARIO VIEWS ====================

class UsuarioListCreateView(ListCreateAPIView):
    """
    GET /api/usuarios/ - Lista todos os usuários (mais recente primeiro)
    POST /api/usuarios/ - Cria um novo usuário
    """
    serializer_class = UsuarioSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Usuario.objects.all().order_by('-id')  # Mais recente primeiro


class UsuarioDetailView(RetrieveUpdateDestroyAPIView):
    """
    GET /api/usuarios/{id}/ - Detalhes de um usuário
    PUT /api/usuarios/{id}/ - Atualiza completamente um usuário
    PATCH /api/usuarios/{id}/ - Atualiza parcialmente um usuário
    DELETE /api/usuarios/{id}/ - Deleta um usuário
    """
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]


# ==================== ESTOQUE VIEWS ====================

class EstoqueListCreateView(ListCreateAPIView):
    """
    GET /api/estoque/ - Lista todos os produtos (mais recente primeiro)
    POST /api/estoque/ - Cria um novo produto
    """
    serializer_class = EstoqueSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Estoque.objects.all().order_by('-criado_em')  # Mais recente primeiro


class EstoqueDetailView(RetrieveUpdateDestroyAPIView):
    """
    GET /api/estoque/{id}/ - Detalhes de um produto
    PUT /api/estoque/{id}/ - Atualiza completamente um produto
    PATCH /api/estoque/{id}/ - Atualiza parcialmente um produto
    DELETE /api/estoque/{id}/ - Deleta um produto
    """
    queryset = Estoque.objects.all()
    serializer_class = EstoqueSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]


class EstoqueEntradaView(APIView):
    def post(self, request, pk):
        try:
            estoque = Estoque.objects.get(pk=pk)
        except Estoque.DoesNotExist:
            return Response({"erro": "Produto não encontrado"}, status=404)

        quantidade = request.data.get("quantidade")

        if quantidade is None:
            return Response({"erro": "O campo 'quantidade' é obrigatório"}, status=400)

        try:
            quantidade = int(quantidade)
        except:
            return Response({"erro": "Quantidade inválida"}, status=400)

        if quantidade <= 0:
            return Response({"erro": "A quantidade deve ser maior que zero"}, status=400)

        # Atualiza a quantidade do estoque
        estoque.quantidade += quantidade
        estoque.save()

        return Response({
            "mensagem": "Entrada registrada com sucesso",
            "id": estoque.id,
            "novo_total": estoque.quantidade
        }, status=200)
class EstoqueSaidaView(APIView):
    def post(self, request, pk):
        try:
            estoque = Estoque.objects.get(pk=pk)
        except Estoque.DoesNotExist:
            return Response({"erro": "Produto não encontrado"}, status=404)

        quantidade = request.data.get("quantidade")

        if quantidade is None:
            return Response({"erro": "O campo 'quantidade' é obrigatório"}, status=400)

        try:
            quantidade = int(quantidade)
        except:
            return Response({"erro": "Quantidade inválida"}, status=400)

        if quantidade <= 0:
            return Response({"erro": "A quantidade deve ser maior que zero"}, status=400)

        # Verifica se tem estoque suficiente
        if quantidade > estoque.quantidade:
            return Response(
                {"erro": f"Estoque insuficiente! Estoque atual: {estoque.quantidade}"},
                status=400
            )

        # Subtrai do estoque
        estoque.quantidade -= quantidade
        estoque.save()

        return Response({
            "mensagem": "Saída registrada com sucesso",
            "id": estoque.id,
            "novo_total": estoque.quantidade
        }, status=200)

# ==================== HISTORICO VIEWS ====================

class HistoricoListView(ListAPIView):
    """
    GET /api/historico/ - Lista todo o histórico (mais recente primeiro)
    Filtros disponíveis:
    - ?produto_id=1
    - ?tipo_operacao=entrada
    - ?responsavel_id=1
    """
    serializer_class = HistoricoSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Busca com select_related para otimizar
        queryset = Historico.objects.select_related('responsavel', 'produto').all()
        
        # Filtro por produto
        produto_id = self.request.query_params.get('produto_id')
        if produto_id:
            queryset = queryset.filter(produto_id=produto_id)
        
        # Filtro por tipo de operação
        tipo_operacao = self.request.query_params.get('tipo_operacao')
        if tipo_operacao in ['entrada', 'saida']:
            queryset = queryset.filter(tipo_operacao=tipo_operacao)
        
        # Filtro por responsável
        responsavel_id = self.request.query_params.get('responsavel_id')
        if responsavel_id:
            queryset = queryset.filter(responsavel_id=responsavel_id)
        
        # Ordena por mais recente primeiro
        return queryset.order_by('-data_hora')


class HistoricoDetailView(RetrieveAPIView):
    """
    GET /api/historico/{id}/ - Detalhes de um registro do histórico
    """
    queryset = Historico.objects.select_related('responsavel', 'produto').all()
    serializer_class = HistoricoSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]