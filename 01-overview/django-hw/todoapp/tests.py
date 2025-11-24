from django.test import TestCase, Client
from django.urls import reverse
from .models import Todo
from datetime import datetime, timedelta

class TodoModelTest(TestCase):
    def setUp(self):
        self.todo = Todo.objects.create(
            title='Test Todo',
            description='Test Description',
            status='pending'
        )
    
    def test_todo_creation(self):
        self.assertEqual(self.todo.title, 'Test Todo')
        self.assertEqual(self.todo.status, 'pending')
    
    def test_todo_string_representation(self):
        self.assertEqual(str(self.todo), 'Test Todo')
    
    def test_todo_default_status(self):
        new_todo = Todo.objects.create(title='Another Todo')
        self.assertEqual(new_todo.status, 'pending')

class TodoViewTest(TestCase):
    def setUp(self):
        self.client = Client()
        self.todo = Todo.objects.create(
            title='Test Todo',
            description='Test Description',
            status='pending'
        )
    
    def test_todo_list_view(self):
        response = self.client.get(reverse('todo-list'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Test Todo')
    
    def test_todo_create_view_get(self):
        response = self.client.get(reverse('todo-create'))
        self.assertEqual(response.status_code, 200)
    
    def test_todo_create_view_post(self):
        data = {
            'title': 'New Todo',
            'description': 'New Description',
            'status': 'pending'
        }
        response = self.client.post(reverse('todo-create'), data)
        self.assertEqual(response.status_code, 302)
        self.assertTrue(Todo.objects.filter(title='New Todo').exists())
    
    def test_todo_update_view_get(self):
        response = self.client.get(reverse('todo-edit', args=[self.todo.pk]))
        self.assertEqual(response.status_code, 200)
    
    def test_todo_update_view_post(self):
        data = {
            'title': 'Updated Todo',
            'description': 'Updated Description',
            'status': 'pending'
        }
        response = self.client.post(reverse('todo-edit', args=[self.todo.pk]), data)
        self.assertEqual(response.status_code, 302)
        self.todo.refresh_from_db()
        self.assertEqual(self.todo.title, 'Updated Todo')
    
    def test_todo_delete_view(self):
        response = self.client.post(reverse('todo-delete', args=[self.todo.pk]))
        self.assertEqual(response.status_code, 302)
        self.assertFalse(Todo.objects.filter(pk=self.todo.pk).exists())
    
    def test_todo_resolve_view(self):
        response = self.client.post(reverse('todo-resolve', args=[self.todo.pk]))
        self.assertEqual(response.status_code, 302)
        self.todo.refresh_from_db()
        self.assertEqual(self.todo.status, 'resolved')