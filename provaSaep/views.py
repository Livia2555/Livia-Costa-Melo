from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView, ListAPIView, RetrieveAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.shortcuts import get_object_or_404
from .models import Usuario, Estoque, Historico
from .serializers import (
    UsuarioSerializer,
    EstoqueSerializer,
    HistoricoSerializer,
    EntradaSaidaSerializer
)


# ==================== USUARIO VIEWS ====================

class UsuarioListCreateView(ListCreateAPIView):
    """
    GET /api/usuarios/ - Lista todos os usuários
    POST /api/usuarios/ - Cria um novo usuário
    """
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]


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
    GET /api/estoque/ - Lista todos os produtos
    POST /api/estoque/ - Cria um novo produto
    """
    queryset = Estoque.objects.all()
    serializer_class = EstoqueSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]


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
    """
    POST /api/estoque/{id}/entrada/
    Adiciona quantidade ao estoque (ENTRADA)
    Body: {"quantidade": 10}
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    def post(self, request, pk):
        produto = get_object_or_404(Estoque, pk=pk)
        serializer = EntradaSaidaSerializer(data=request.data)
        
        if serializer.is_valid():
            quantidade = serializer.validated_data['quantidade']
            
            # Atualiza o estoque
            produto.quantidade += quantidade
            produto.save()
            
            # Cria registro no histórico
            # ATENÇÃO: Ajuste conforme seu modelo de autenticação
            Historico.objects.create(
                responsavel=request.user.usuario if hasattr(request.user, 'usuario') else Usuario.objects.first(),
                produto=produto,
                tipo_operacao='entrada',
                quantidade=quantidade
            )
            
            return Response({
                'message': 'Entrada registrada com sucesso',
                'produto': produto.tipo,
                'quantidade_adicionada': quantidade,
                'quantidade_atual': produto.quantidade
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EstoqueSaidaView(APIView):
    """
    POST /api/estoque/{id}/saida/
    Remove quantidade do estoque (SAÍDA)
    Body: {"quantidade": 5}
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    def post(self, request, pk):
        produto = get_object_or_404(Estoque, pk=pk)
        serializer = EntradaSaidaSerializer(data=request.data)
        
        if serializer.is_valid():
            quantidade = serializer.validated_data['quantidade']
            
            # Verifica se há quantidade suficiente
            if produto.quantidade < quantidade:
                return Response({
                    'error': 'Quantidade insuficiente em estoque',
                    'quantidade_disponivel': produto.quantidade,
                    'quantidade_solicitada': quantidade
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Atualiza o estoque
            produto.quantidade -= quantidade
            produto.save()
            
            # Cria registro no histórico
            Historico.objects.create(
                responsavel=request.user.usuario if hasattr(request.user, 'usuario') else Usuario.objects.first(),
                produto=produto,
                tipo_operacao='saida',
                quantidade=quantidade
            )
            
            return Response({
                'message': 'Saída registrada com sucesso',
                'produto': produto.tipo,
                'quantidade_removida': quantidade,
                'quantidade_atual': produto.quantidade
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ==================== HISTORICO VIEWS ====================

class HistoricoListView(ListAPIView):
    """
    GET /api/historico/ - Lista todo o histórico
    Filtros disponíveis:
    - ?produto_id=1
    - ?tipo_operacao=entrada
    - ?responsavel_id=1
    """
    serializer_class = HistoricoSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
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
        
        return queryset


class HistoricoDetailView(RetrieveAPIView):
    """
    GET /api/historico/{id}/ - Detalhes de um registro do histórico
    """
    queryset = Historico.objects.select_related('responsavel', 'produto').all()
    serializer_class = HistoricoSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]