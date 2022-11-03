import { call, put, takeLatest, select } from 'redux-saga/effects'
import { taskService } from '../../../services/TaskService'
import { STATUS_CODE } from '../../../util/constants/settingSystem';
import { DISPLAY_LOADING, HIDE_LOADING } from '../../constants/LoadingConst';
import { notifiFunction } from '../../../util/Notification/notificationCyberbugs';
import { GET_TASK_DETAIL_SAGA, GET_TASK_DETAIL, UPDATE_STATUS_TASK, UPDATE_STATUS_TASK_SAGA, UPDATE_TASK_SAGA, HANDLE_CHANGE_POST_API_SAGA, CHANGE_TASK_MODAL, CHANGE_ASSIGNESS, REMOVE_USER_ASSIGN } from '../../constants/Cyberbugs/TaskConstants'

function* createTaskSaga(action) {
    try {

        yield put({
            type: DISPLAY_LOADING
        })
        const { data, status } = yield call(() => taskService.createTask(action.taskObject));
        if (status === STATUS_CODE.SUCCESS) {
            console.log(data);
        }
        yield put({
            type: 'CLOSE_DRAWER'
        })
        notifiFunction('success', 'Create task successfully!');

    } catch (err) {
        console.log(err.response.data)
    }

    yield put({
        type: HIDE_LOADING
    })
}

export function* theoDoiCreateTaskSaga() {
    yield takeLatest('CREATE_TASK_SAGA', createTaskSaga);
}

function* getTaskDetailSaga(action) {

    const { taskId } = action;

    try {
        const { data, status } = yield call(() => taskService.getTaskDetail(taskId));
        yield put({
            type: GET_TASK_DETAIL,
            taskDetailModal: data.content
        })

    } catch (err) {
        console.log(err)
        console.log(err.response?.data)
    }
}

export function* theoDoiGetTaskDetailSaga() {
    yield takeLatest(GET_TASK_DETAIL_SAGA, getTaskDetailSaga);
}

function* updateTaskStatusSaga(action) {

    const { taskUpdateStatus } = action;

    try {
        // Cập nhật API status cho task hiện tại (Task đang mở modal)
        const { data, status } = yield call(() => taskService.updateStatusTask(taskUpdateStatus));
        // Sau khi thành công gọi lại getProjectDetail saga để sắp xếp lại thông tin các task
        if (status === STATUS_CODE.SUCCESS) {
            yield put({
                type: 'GET_PROJECT_DETAIL',
                projectId: taskUpdateStatus.projectId
            })

            yield put({
                type: GET_TASK_DETAIL_SAGA,
                taskId: taskUpdateStatus.taskId
            })
        }

    } catch (err) {
        console.log(err)
        console.log(err.response?.data)
    }
}

export function* theoDoiUpdateTaskStatusSaga() {
    yield takeLatest(UPDATE_STATUS_TASK_SAGA, updateTaskStatusSaga);
}

function* updateTaskSaga(action) {

}

export function* theoDoiUpdateTask() {
    yield takeLatest(UPDATE_TASK_SAGA, updateTaskSaga)
}

export function* handleChangePostApi(action) {
    // Gọi action làm thay đổi taskDetail modal
    // eslint-disable-next-line default-case
    switch (action.actionType) {
        case CHANGE_TASK_MODAL: {
            const { value, name } = action;
            yield put({
                type: CHANGE_TASK_MODAL,
                name,
                value
            });
        };break;

        // eslint-disable-next-line no-fallthrough
        case CHANGE_ASSIGNESS: {
            const { userSelected } = action;
            yield put({
                type: CHANGE_ASSIGNESS,
                userSelected
            })
        };break;

        // eslint-disable-next-line no-fallthrough
        case REMOVE_USER_ASSIGN: {
            const { userId } = action;
            yield put({
                type: REMOVE_USER_ASSIGN,
                userId
            })
        };break;
    }

    // Save qua api updateTaskSaga
    // Lấy dữ liệu từ state.taskDetailModal
    let { taskDetailModal } = yield select(state => state.TaskReducer);

    // Biến đổi dữ liệu state.taskDetailModal thành dữ liệu api cần
    const listUserAsign = taskDetailModal.assigness?.map((user, index) => {
        return user.id;
    })

    const taskUpdateApi = { ...taskDetailModal, listUserAsign }

    try {

        const { data, status } = yield call(() => taskService.updateTask(taskUpdateApi));

        if (status === STATUS_CODE.SUCCESS) {
            yield put({
                type: 'GET_PROJECT_DETAIL',
                projectId: taskUpdateApi.projectId
            })

            yield put({
                type: GET_TASK_DETAIL_SAGA,
                taskId: taskUpdateApi.taskId
            })
        }
    } catch (err) {
        console.log(err.response?.data)
        console.log(err)
    }
}

export function* theoDoiHandleChangePostApi() {
    yield takeLatest(HANDLE_CHANGE_POST_API_SAGA, handleChangePostApi)
}