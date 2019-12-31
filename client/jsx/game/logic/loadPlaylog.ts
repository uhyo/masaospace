import { getApi } from '../../../actions/api';
import errorStore from '../../../stores/error';

export function loadPlaylog(
  playlogId: string,
): Promise<ArrayBuffer | undefined> {
  return getApi('/api/playlog/get', { id: playlogId }, true).catch(
    err => void errorStore.emit(err),
  );
}
