from django.db import models
from django.contrib.auth.models import AbstractUser

TIPO = [
    ('smartphones', 'smartphones'),
    ('notebooks', 'notebooks'),
    ('smart TVs', 'smart TVs'),
]

class Usuario(models.Model):
    email= models.CharField(max_length=30)
    senha= models.CharField(max_length=10)

    def __str__(self):
        return self.email
    

class Estoque(models.Model):
    tipo = models.CharField(max_length=20, choices=TIPO)
    tensao = models.IntegerField()  
    dimencoes = models.CharField(max_length=20)
    resolucao = models.CharField(max_length=20)
    capacidade = models.IntegerField()  
    conectividade = models.CharField(max_length=10)
    quantidade = models.IntegerField()

    def __str__(self):
        return  f"{self.tipo} - {self.id}"
    

class Historico(models.Model):
    TIPO_OPERACAO = [
        ('entrada', 'Entrada'),
        ('saida', 'Saída'),
    ]
    responsavel = models.ForeignKey(Usuario,on_delete=models.CASCADE)
    produto = models.ForeignKey(Estoque, on_delete=models.CASCADE )
    tipo_operacao = models.CharField(max_length=10, choices=TIPO_OPERACAO)
    quantidade = models.IntegerField()
    data_hora = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.responsavel} - {self.produto.tipo} - {self.tipo_operacao} - {self.quantidade} unidades  - {self.data_hora}"