from django.urls import path
from .views import (
    GetMateriasView,
    ProcessDocumentView,
    RefineSummaryView,
    UpdateHistoryRawSummaryView,
    PublishSummaryView,
    HistoryListView,
    HistoryDetailView
)

urlpatterns = [
    path('notion/materias-semanas/', GetMateriasView.as_view(), name='get_materias'),
    
    path('process/', ProcessDocumentView.as_view(), name='process_documents'),
    path('chat/refine/', RefineSummaryView.as_view(), name='refine_summary'),
    path('notion/publish/', PublishSummaryView.as_view(), name='publish_summary'),
    
    path('history/', HistoryListView.as_view(), name='history_list'),
    path('history/<str:session_id>/', HistoryDetailView.as_view(), name='history_detail'),
    path('history/<str:session_id>/update-summary/', UpdateHistoryRawSummaryView.as_view(), name='history_update_summary'),
]
