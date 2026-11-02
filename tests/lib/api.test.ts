import { beforeEach, describe, expect, it, vi } from 'vitest';
// We'll import from the module we're about to create
import { createApiClient, type GranolaApi } from '../../src/lib/api.js';
import { ApiError, type HttpClient } from '../../src/lib/http.js';

describe('api client', () => {
  let mockHttpClient: HttpClient;
  let api: GranolaApi;

  beforeEach(() => {
    mockHttpClient = {
      post: vi.fn(),
      setToken: vi.fn(),
    };
    api = createApiClient(mockHttpClient);
  });

  describe('createApiClient', () => {
    it('should create an API client with all methods', () => {
      expect(api).toBeDefined();
      expect(api.getDocuments).toBeDefined();
      expect(api.getDocumentsBatch).toBeDefined();
      expect(api.getDocumentMetadata).toBeDefined();
      expect(api.getDocumentTranscript).toBeDefined();
      expect(api.getDocumentLists).toBeDefined();
      expect(api.getDocumentList).toBeDefined();
      expect(api.getWorkspaces).toBeDefined();
      expect(api.setToken).toBeDefined();
    });
  });

  describe('getDocuments', () => {
    it('should call POST /v2/get-documents with default options', async () => {
      vi.mocked(mockHttpClient.post).mockResolvedValue({ docs: [] });

      await api.getDocuments();

      expect(mockHttpClient.post).toHaveBeenCalledWith('/v2/get-documents', {
        include_last_viewed_panel: false,
      });
    });

    it('should pass workspace_id when provided', async () => {
      vi.mocked(mockHttpClient.post).mockResolvedValue({ docs: [] });

      await api.getDocuments({ workspace_id: 'ws-123' });

      expect(mockHttpClient.post).toHaveBeenCalledWith('/v2/get-documents', {
        workspace_id: 'ws-123',
        include_last_viewed_panel: false,
      });
    });

    it('should pass limit and offset when provided', async () => {
      vi.mocked(mockHttpClient.post).mockResolvedValue({ docs: [] });

      await api.getDocuments({ limit: 50, offset: 10 });

      expect(mockHttpClient.post).toHaveBeenCalledWith('/v2/get-documents', {
        limit: 50,
        offset: 10,
        include_last_viewed_panel: false,
      });
    });

    it('should pass include_last_viewed_panel when true', async () => {
      vi.mocked(mockHttpClient.post).mockResolvedValue({ docs: [] });

      await api.getDocuments({ include_last_viewed_panel: true });

      expect(mockHttpClient.post).toHaveBeenCalledWith('/v2/get-documents', {
        include_last_viewed_panel: true,
      });
    });

    it('should return the response from the API', async () => {
      const mockResponse = {
        docs: [{ id: 'doc-1', title: 'Meeting 1' }],
        next_cursor: 'cursor-abc',
      };
      vi.mocked(mockHttpClient.post).mockResolvedValue(mockResponse);

      const result = await api.getDocuments();

      expect(result).toEqual(mockResponse);
    });
  });

  describe('getDocumentsBatch', () => {
    it('should call POST /v1/get-documents-batch with document_ids', async () => {
      vi.mocked(mockHttpClient.post).mockResolvedValue({ documents: [] });

      await api.getDocumentsBatch({ document_ids: ['doc-1', 'doc-2'] });

      expect(mockHttpClient.post).toHaveBeenCalledWith('/v1/get-documents-batch', {
        document_ids: ['doc-1', 'doc-2'],
        include_last_viewed_panel: false,
      });
    });

    it('should pass include_last_viewed_panel when true', async () => {
      vi.mocked(mockHttpClient.post).mockResolvedValue({ documents: [] });

      await api.getDocumentsBatch({
        document_ids: ['doc-1'],
        include_last_viewed_panel: true,
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith('/v1/get-documents-batch', {
        document_ids: ['doc-1'],
        include_last_viewed_panel: true,
      });
    });

    it('should return documents from the response', async () => {
      const mockDocs = [{ id: 'doc-1', title: 'Meeting 1' }];
      vi.mocked(mockHttpClient.post).mockResolvedValue({ documents: mockDocs });

      const result = await api.getDocumentsBatch({ document_ids: ['doc-1'] });

      expect(result).toEqual({ documents: mockDocs });
    });

    it('should handle response with docs field instead of documents', async () => {
      const mockDocs = [{ id: 'doc-1', title: 'Meeting 1' }];
      vi.mocked(mockHttpClient.post).mockResolvedValue({ docs: mockDocs });

      const result = await api.getDocumentsBatch({ document_ids: ['doc-1'] });

      expect(result).toEqual({ docs: mockDocs });
    });
  });

  describe('getDocumentMetadata', () => {
    it('should call POST /v1/get-document-metadata with document_id', async () => {
      vi.mocked(mockHttpClient.post).mockResolvedValue({ creator: {}, attendees: [] });

      await api.getDocumentMetadata('doc-123');

      expect(mockHttpClient.post).toHaveBeenCalledWith('/v1/get-document-metadata', {
        document_id: 'doc-123',
      });
    });

    it('should return the metadata response', async () => {
      const mockMetadata = {
        creator: { name: 'John', email: 'john@example.com' },
        attendees: [{ name: 'Jane', email: 'jane@example.com' }],
      };
      vi.mocked(mockHttpClient.post).mockResolvedValue(mockMetadata);

      const result = await api.getDocumentMetadata('doc-123');

      expect(result).toEqual(mockMetadata);
    });
  });

  describe('getDocumentPanels', () => {
    it('should call POST /v1/get-document-panels with document_id and return the panels', async () => {
      const panels = [{ id: 'panel-1', template_slug: 'meeting-summary-consolidated' }];
      vi.mocked(mockHttpClient.post).mockResolvedValue(panels);

      const result = await api.getDocumentPanels('doc-123');

      expect(mockHttpClient.post).toHaveBeenCalledWith('/v1/get-document-panels', {
        document_id: 'doc-123',
      });
      expect(result).toEqual(panels);
    });
  });

  describe('getDocumentTranscript', () => {
    it('should call POST /v1/get-document-transcript with document_id', async () => {
      vi.mocked(mockHttpClient.post).mockResolvedValue([]);

      await api.getDocumentTranscript('doc-123');

      expect(mockHttpClient.post).toHaveBeenCalledWith('/v1/get-document-transcript', {
        document_id: 'doc-123',
      });
    });

    it('should return the transcript array', async () => {
      const mockTranscript = [
        {
          id: 'seg-1',
          text: 'Hello everyone',
          source: 'microphone',
          start_timestamp: '2025-01-01T10:00:00.000Z',
          end_timestamp: '2025-01-01T10:00:02.000Z',
        },
      ];
      vi.mocked(mockHttpClient.post).mockResolvedValue(mockTranscript);

      const result = await api.getDocumentTranscript('doc-123');

      expect(result).toEqual(mockTranscript);
    });
  });

  describe('getDocumentLists', () => {
    it('should request folder metadata with document IDs', async () => {
      vi.mocked(mockHttpClient.post).mockResolvedValue({ lists: {} });

      await api.getDocumentLists();

      expect(mockHttpClient.post).toHaveBeenCalledWith('/v1/get-document-lists-metadata', {
        include_document_ids: true,
        include_only_joined_lists: false,
      });
    });

    it('should return folders from the keyed metadata response', async () => {
      const mockFolders = {
        'folder-1': {
          id: 'folder-1',
          title: 'Sales calls',
          workspace_id: 'ws-123',
          document_ids: ['doc-1'],
        },
      };
      vi.mocked(mockHttpClient.post).mockResolvedValue({ lists: mockFolders });

      const result = await api.getDocumentLists();

      expect(result).toEqual([mockFolders['folder-1']]);
    });

    it('should return an empty array when no folders exist', async () => {
      vi.mocked(mockHttpClient.post).mockResolvedValue({ lists: {} });

      expect(await api.getDocumentLists()).toEqual([]);
    });
  });

  describe('getDocumentList', () => {
    it('should call POST /v1/get-document-list with list_id and return the folder', async () => {
      const folder = { id: 'folder-2', title: 'Support', documents: [{ id: 'doc-2' }] };
      vi.mocked(mockHttpClient.post).mockResolvedValue(folder);

      const result = await api.getDocumentList('folder-2');

      expect(mockHttpClient.post).toHaveBeenCalledWith('/v1/get-document-list', {
        list_id: 'folder-2',
      });
      expect(result).toEqual(folder);
    });

    it('should return null when the folder does not exist (HTTP 404)', async () => {
      vi.mocked(mockHttpClient.post).mockRejectedValue(new ApiError('HTTP 404: Not Found', 404));

      expect(await api.getDocumentList('nonexistent')).toBeNull();
    });

    it('should rethrow other errors', async () => {
      const error = new ApiError('HTTP 500: Internal Server Error', 500);
      vi.mocked(mockHttpClient.post).mockRejectedValue(error);

      await expect(api.getDocumentList('folder-1')).rejects.toBe(error);
    });
  });

  describe('getWorkspaces', () => {
    it('should call POST /v1/get-workspaces', async () => {
      vi.mocked(mockHttpClient.post).mockResolvedValue({ workspaces: [] });

      await api.getWorkspaces();

      expect(mockHttpClient.post).toHaveBeenCalledWith('/v1/get-workspaces', {});
    });

    it('should return the workspaces response', async () => {
      const mockResponse = {
        workspaces: [
          {
            workspace: {
              workspace_id: 'ws-123',
              display_name: 'My Workspace',
            },
            role: 'owner',
            plan_type: 'pro',
          },
        ],
      };
      vi.mocked(mockHttpClient.post).mockResolvedValue(mockResponse);

      const result = await api.getWorkspaces();

      expect(result).toEqual(mockResponse);
    });
  });

  describe('setToken', () => {
    it('should delegate to httpClient.setToken', () => {
      api.setToken('new-token');

      expect(mockHttpClient.setToken).toHaveBeenCalledWith('new-token');
    });
  });
});
