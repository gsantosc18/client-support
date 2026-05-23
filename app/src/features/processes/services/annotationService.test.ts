import { annotationService } from './annotationService';
import api from '../../../services/api';

jest.mock('../../../services/api', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}));

describe('annotationService', () => {
  const processId = 'proc-123';
  const annotationId = 'anno-456';
  const mockAnnotation = {
    id: annotationId,
    process_id: processId,
    annotation: 'Teste de anotação',
    visibility: 'PUBLIC',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call list with correct URL', async () => {
    const mockList = [mockAnnotation];
    (api.get as jest.Mock).mockResolvedValue({ data: mockList });

    const result = await annotationService.list(processId);

    expect(api.get).toHaveBeenCalledWith(`/processes/${processId}/annotations`);
    expect(result).toEqual(mockList);
  });

  it('should call create with correct URL and payload', async () => {
    const payload = { annotation: 'Nova nota', visibility: 'PRIVATE' };
    (api.post as jest.Mock).mockResolvedValue({ data: mockAnnotation });

    const result = await annotationService.create(processId, payload);

    expect(api.post).toHaveBeenCalledWith(`/processes/${processId}/annotations`, payload);
    expect(result).toEqual(mockAnnotation);
  });

  it('should call update with correct URL and payload', async () => {
    const payload = { annotation: 'Texto alterado' };
    (api.put as jest.Mock).mockResolvedValue({ data: mockAnnotation });

    const result = await annotationService.update(processId, annotationId, payload);

    expect(api.put).toHaveBeenCalledWith(`/processes/${processId}/annotations/${annotationId}`, payload);
    expect(result).toEqual(mockAnnotation);
  });

  it('should call delete with correct URL', async () => {
    const deleteResponse = { message: 'deletado', id: annotationId };
    (api.delete as jest.Mock).mockResolvedValue({ data: deleteResponse });

    const result = await annotationService.delete(processId, annotationId);

    expect(api.delete).toHaveBeenCalledWith(`/processes/${processId}/annotations/${annotationId}`);
    expect(result).toEqual(deleteResponse);
  });
});
