from django.shortcuts import render, redirect, get_object_or_404
from django.views import View
from .models import Todo
from .forms import TodoForm

class TodoListView(View):
    def get(self, request):
        todos = Todo.objects.all()
        return render(request, 'todoapp/list.html', {'todos': todos})

class TodoCreateView(View):
    def get(self, request):
        form = TodoForm()
        return render(request, 'todoapp/form.html', {'form': form, 'title': 'Create Todo'})
    
    def post(self, request):
        form = TodoForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('todo-list')
        return render(request, 'todoapp/form.html', {'form': form, 'title': 'Create Todo'})

class TodoUpdateView(View):
    def get(self, request, pk):
        todo = get_object_or_404(Todo, pk=pk)
        form = TodoForm(instance=todo)
        return render(request, 'todoapp/form.html', {'form': form, 'todo': todo, 'title': 'Edit Todo'})
    
    def post(self, request, pk):
        todo = get_object_or_404(Todo, pk=pk)
        form = TodoForm(request.POST, instance=todo)
        if form.is_valid():
            form.save()
            return redirect('todo-list')
        return render(request, 'todoapp/form.html', {'form': form, 'todo': todo, 'title': 'Edit Todo'})

class TodoDeleteView(View):
    def post(self, request, pk):
        todo = get_object_or_404(Todo, pk=pk)
        todo.delete()
        return redirect('todo-list')

class TodoResolveView(View):
    def post(self, request, pk):
        todo = get_object_or_404(Todo, pk=pk)
        todo.status = 'resolved'
        todo.save()
        return redirect('todo-list')