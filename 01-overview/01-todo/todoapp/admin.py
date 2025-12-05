from django.contrib import admin
from .models import Todo

@admin.register(Todo)
class TodoAdmin(admin.ModelAdmin):
    list_display = ['title', 'status', 'due_date', 'created_at']
    list_filter = ['status', 'due_date']
    search_fields = ['title', 'description']
