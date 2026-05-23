import { renderHook, act } from '@testing-library/react';
import { useProcessAnnotations } from './useProcessAnnotations';
import { annotationService } from '../services/annotationService';

jest.mock('../services/annotationService', () => ({
  annotationService: {
    list: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('useProcessAnnotations hook', () => {
  const processId = 'proc-123';
  const mockAnnotation = {
    id: 'anno-456',
    process_id: processId,
    annotation: 'Test',
    visibility: 'PUBLIC' as const,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch annotations successfully', async () => {
    const mockList = [mockAnnotation];
    (annotationService.list as jest.Mock).mockResolvedValue(mockList);

    const { result } = renderHook(() => useProcessAnnotations());

    let fetchResult;
    await act(async () => {
      fetchResult = await result.current.fetchAnnotations(processId);
    });

    expect(annotationService.list).toHaveBeenCalledWith(processId);
    expect(result.current.annotations).toEqual(mockList);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(fetchResult).toEqual(mockList);
  });

  it('should handle fetch annotations error', async () => {
    const errorResponse = {
      response: {
        data: {
          message: 'Erro na API',
        },
      },
    };
    (annotationService.list as jest.Mock).mockRejectedValue(errorResponse);

    const { result } = renderHook(() => useProcessAnnotations());

    await act(async () => {
      await result.current.fetchAnnotations(processId);
    });

    expect(result.current.annotations).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Erro na API');
  });

  it('should create annotation and prepend it to list', async () => {
    (annotationService.create as jest.Mock).mockResolvedValue(mockAnnotation);

    const { result } = renderHook(() => useProcessAnnotations());

    await act(async () => {
      await result.current.createAnnotation(processId, 'Test', 'PUBLIC');
    });

    expect(annotationService.create).toHaveBeenCalledWith(processId, {
      annotation: 'Test',
      visibility: 'PUBLIC',
    });
    expect(result.current.annotations).toEqual([mockAnnotation]);
  });

  it('should update annotation in the list', async () => {
    const initialList = [mockAnnotation];
    (annotationService.list as jest.Mock).mockResolvedValue(initialList);

    const { result } = renderHook(() => useProcessAnnotations());

    // Fill initial state
    await act(async () => {
      await result.current.fetchAnnotations(processId);
    });

    const updatedAnnotation = { ...mockAnnotation, annotation: 'Updated' };
    (annotationService.update as jest.Mock).mockResolvedValue(updatedAnnotation);

    await act(async () => {
      await result.current.updateAnnotation(processId, mockAnnotation.id, 'Updated');
    });

    expect(annotationService.update).toHaveBeenCalledWith(processId, mockAnnotation.id, {
      annotation: 'Updated',
    });
    expect(result.current.annotations).toEqual([updatedAnnotation]);
  });

  it('should delete annotation from list', async () => {
    const initialList = [mockAnnotation];
    (annotationService.list as jest.Mock).mockResolvedValue(initialList);

    const { result } = renderHook(() => useProcessAnnotations());

    // Fill initial state
    await act(async () => {
      await result.current.fetchAnnotations(processId);
    });

    (annotationService.delete as jest.Mock).mockResolvedValue({ message: 'Success' });

    let deleteSuccess;
    await act(async () => {
      deleteSuccess = await result.current.deleteAnnotation(processId, mockAnnotation.id);
    });

    expect(annotationService.delete).toHaveBeenCalledWith(processId, mockAnnotation.id);
    expect(result.current.annotations).toEqual([]);
    expect(deleteSuccess).toBe(true);
  });
});
