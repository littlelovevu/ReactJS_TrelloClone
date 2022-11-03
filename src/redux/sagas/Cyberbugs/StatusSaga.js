import { call, put, takeLatest } from 'redux-saga/effects'
import { statusService } from '../../../services/StatusService';
import { GET_ALL_PRIORITY_SAGA } from '../../constants/Cyberbugs/PriorityConstants';
import { GET_ALL_STATUS } from '../../constants/Cyberbugs/StatusConstant';

function* getAllStatusSaga(action) {
    try {

        const { data, status } = yield call(() => statusService.getAllStatus());

        yield put({
            type: GET_ALL_STATUS,
            arrStatus: data.content
        })


    } catch (err) {
        console.log(err.response?.data);
    }
}

export function* theoDoiGetAllStatusSaga() {
    yield takeLatest(GET_ALL_PRIORITY_SAGA, getAllStatusSaga);
}