from .models import Usuario, Estoque, Historico
from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class LoginSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['usuario'] = {
            'id': self.user.id,
            'username': self.user.username,
            'email': self.user.email,
            'is_staff': self.user.is_staff,
            'is_superuser': self.user.is_superuser,
        }
        return data


class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:  
        model = Usuario
        fields = '__all__'
        extra_kwargs = {
            'senha': {'write_only': True}
        }


class EstoqueSerializer(serializers.ModelSerializer):
    """Serializer completo para estoque - mostra TODOS os campos"""
    
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)
    
    class Meta:
        model = Estoque
        fields = [
            'id',
            'nome',
            'tipo',
            'tipo_display',
            'tensao',
            'dimencoes',
            'resolucao',
            'capacidade',
            'conectividade',
            'quantidade'
        ]
        read_only_fields = ['id']
    
    def validate_quantidade(self, value):
        if value < 0:
            raise serializers.ValidationError("A quantidade não pode ser negativa.")
        return value
    
    def validate_tensao(self, value):
        if value < 0:
            raise serializers.ValidationError("A tensão não pode ser negativa.")
        return value
    
    def validate_capacidade(self, value):
        if value < 0:
            raise serializers.ValidationError("A capacidade não pode ser negativa.")
        return value


class HistoricoSerializer(serializers.ModelSerializer):
    # Dados do usuário
    responsavel_id = serializers.IntegerField(source='responsavel.id', read_only=True)
    responsavel_username = serializers.CharField(source='responsavel.username', read_only=True)
    responsavel_email = serializers.CharField(source='responsavel.email', read_only=True)

    # Dados do produto
    produto_id = serializers.IntegerField(source='produto.id', read_only=True)
    produto_nome = serializers.CharField(source='produto.nome', read_only=True)
    produto_tipo = serializers.CharField(source='produto.tipo', read_only=True)

    tipo_operacao_display = serializers.CharField(source='get_tipo_operacao_display', read_only=True)

    data_hora_formatada = serializers.SerializerMethodField()

    class Meta:
        model = Historico
        fields = [
            'id',
            'responsavel',
            'responsavel_id',
            'responsavel_username',
            'responsavel_email',

            'produto',
            'produto_id',
            'produto_nome',
            'produto_tipo',

            'tipo_operacao',
            'tipo_operacao_display',

            'quantidade',
            'data_hora',
            'data_hora_formatada'
        ]

        read_only_fields = [
            'id',
            'data_hora',
            'responsavel_id',
            'responsavel_username',
            'responsavel_email',

            'produto_id',
            'produto_nome',
            'produto_tipo',

            'tipo_operacao_display',
            'data_hora_formatada'
        ]

    def get_data_hora_formatada(self, obj):
        return obj.data_hora.strftime('%d/%m/%Y %H:%M:%S')



class EntradaSaidaSerializer(serializers.Serializer):
    """Serializer para operações de entrada/saída de estoque"""
    
    quantidade = serializers.IntegerField(min_value=1)
    
    def validate_quantidade(self, value):
        if value <= 0:
            raise serializers.ValidationError("A quantidade deve ser maior que zero.")
        return value