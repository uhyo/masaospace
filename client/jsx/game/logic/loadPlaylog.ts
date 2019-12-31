import api from '../../../actions/api';
import errorStore from '../../../stores/error';

export function loadPlaylog(
  playlogId: string,
): Promise<ArrayBuffer | undefined> {
  return api('/api/playlog/get', { id: playlogId }, void 0, true).catch(
    errorStore.emit,
  );
}
