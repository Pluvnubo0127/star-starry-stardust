
from django.contrib import admin
from django.urls import path, re_path
from django.views.generic import TemplateView
from django.views.static import serve
from django.conf import settings
import os

urlpatterns = [
    path('admin/', admin.site.urls),
    # Serve the index.html template
    path('', TemplateView.as_view(template_name='index.html'), name='home'),
    
    # Serve static files (js, res) directly to support relative paths in index.html
    # Note: In production, these should be served by Nginx/Apache or WhiteNoise
    re_path(r'^js/(?P<path>.*)$', serve, {
        'document_root': os.path.join(settings.BASE_DIR, 'js'),
    }),
    re_path(r'^res/(?P<path>.*)$', serve, {
        'document_root': os.path.join(settings.BASE_DIR, 'res'),
    }),
    re_path(r'^css/(?P<path>.*)$', serve, {
        'document_root': os.path.join(settings.BASE_DIR, 'css'),
    }),
    re_path(r'^fonts/(?P<path>.*)$', serve, {
        'document_root': os.path.join(settings.BASE_DIR, 'fonts'),
    }),
]
