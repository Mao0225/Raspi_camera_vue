<template>
  <div class="app-container">
    <div class="search-bar">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item>
          <el-button type="primary" @click="handleQuery">
            <template #icon><Search /></template>
            搜索
          </el-button>
          <el-button @click="handleResetQuery">
            <template #icon><Refresh /></template>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-card shadow="never">
      <div class="mb-10px">
        <el-button v-hasPerm="['detect:camera:add']" type="success" @click="handleOpenDialog()">
          <template #icon><Plus /></template>
          新增
        </el-button>
        <el-button
          v-hasPerm="['detect:camera:delete']"
          type="danger"
          :disabled="removeIds.length === 0"
          @click="handleDelete()"
        >
          <template #icon><Delete /></template>
          删除
        </el-button>
      </div>

      <el-table
        ref="dataTableRef"
        v-loading="loading"
        :data="pageData"
        highlight-current-row
        border
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column key="id" label="主键ID" prop="id" min-width="150" align="center" />
        <el-table-column
          key="videoUrl"
          label="视频流地址"
          prop="videoUrl"
          min-width="150"
          align="center"
        />
        <el-table-column
          key="deviceNumber"
          label="摄像头编号"
          prop="deviceNumber"
          min-width="150"
          align="center"
        />
        <el-table-column
          key="raspiNumber"
          label="所属树莓派编号"
          prop="raspiNumber"
          min-width="150"
          align="center"
        />
        <el-table-column
          key="deptName"
          label="部门"
          prop="deptName"
          min-width="150"
          align="center"
        />
        <el-table-column
          key="location"
          label="放置地点"
          prop="location"
          min-width="150"
          align="center"
        />
        <el-table-column
          key="createTime"
          label="创建时间"
          prop="createTime"
          min-width="150"
          align="center"
        />
        <el-table-column
          key="updateTime"
          label="更新时间"
          prop="updateTime"
          min-width="150"
          align="center"
        />
        <el-table-column fixed="right" label="操作" width="220">
          <template #default="scope">
            <el-button
              v-hasPerm="['detect:camera:edit']"
              type="primary"
              size="small"
              link
              @click="handleOpenDialog(scope.row.id)"
            >
              <template #icon><Edit /></template>
              编辑
            </el-button>
            <el-button
              v-hasPerm="['detect:camera:delete']"
              type="danger"
              size="small"
              link
              @click="handleDelete(scope.row.id)"
            >
              <template #icon><Delete /></template>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-if="total > 0"
        v-model:total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="handleQuery()"
      />
    </el-card>

    <!-- 摄像头设备管理表单弹窗 -->
    <el-dialog
      v-model="dialog.visible"
      :title="dialog.title"
      width="500px"
      @close="handleCloseDialog"
    >
      <el-form ref="dataFormRef" :model="formData" :rules="rules" label-width="100px">
        <el-input v-model="formData.id" type="hidden" />
        <el-form-item label="视频流地址" prop="videoUrl">
          <el-input v-model="formData.videoUrl" placeholder="视频流地址" />
        </el-form-item>

        <el-form-item label="摄像头编号" prop="deviceNumber">
          <el-input v-model="formData.deviceNumber" placeholder="摄像头编号" />
        </el-form-item>

        <el-form-item label="所属树莓派编号" prop="raspberryPiId">
          <el-select
            v-model="formData.raspberryPiId"
            placeholder="所属树莓派编号"
            value-key="value"
          >
            <el-option
              v-for="item in raspiOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="放置地点" prop="location">
          <el-input v-model="formData.location" placeholder="放置地点" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleSubmit()">确定</el-button>
          <el-button @click="handleCloseDialog()">取消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: "Camera",
  inheritAttrs: false,
});

import CameraAPI, { CameraPageVO, CameraForm, CameraPageQuery } from "@/api/detect/camera";
import RaspiAPI from "@/api/detect/raspi";

const queryFormRef = ref();
const dataFormRef = ref();

const loading = ref(false);
const removeIds = ref<number[]>([]);
const total = ref(0);

const raspiOptions = ref<OptionType[]>();

const queryParams = reactive<CameraPageQuery>({
  pageNum: 1,
  pageSize: 10,
});

// 摄像头设备管理表格数据
const pageData = ref<CameraPageVO[]>([]);

// 弹窗
const dialog = reactive({
  title: "",
  visible: false,
});

// 摄像头设备管理表单数据
const formData = reactive<CameraForm>({});

// 摄像头设备管理表单校验规则
const rules = reactive({
  deviceNumber: [{ required: true, message: "请输入摄像头编号", trigger: "blur" }],
  raspberryPiId: [{ required: true, message: "请输入所属树莓派ID", trigger: "blur" }],
  location: [{ required: true, message: "请输入放置地点", trigger: "blur" }],
});

/** 查询摄像头设备管理 */
function handleQuery() {
  loading.value = true;
  CameraAPI.getPage(queryParams)
    .then((data) => {
      pageData.value = data.list;
      total.value = data.total;
    })
    .finally(() => {
      loading.value = false;
    });
}

/** 重置摄像头设备管理查询 */
function handleResetQuery() {
  queryFormRef.value!.resetFields();
  queryParams.pageNum = 1;
  handleQuery();
}

/** 行复选框选中记录选中ID集合 */
function handleSelectionChange(selection: any) {
  removeIds.value = selection.map((item: any) => item.id);
}

/** 打开摄像头设备管理弹窗 */
async function handleOpenDialog(id?: number) {
  dialog.visible = true;
  raspiOptions.value = (await RaspiAPI.getOptions()).map((item) => ({
    ...item,
    value: Number(item.value), // 强制转为数字
  }));
  console.log("raspiOptions:", raspiOptions.value);
  if (id) {
    dialog.title = "修改摄像头设备管理";
    CameraAPI.getFormData(id).then((data) => {
      Object.assign(formData, data);
    });
    console.log("formData.raspberryPiId:", formData.raspberryPiId);
  } else {
    dialog.title = "新增摄像头设备管理";
  }
}

/** 提交摄像头设备管理表单 */
function handleSubmit() {
  dataFormRef.value.validate((valid: any) => {
    if (valid) {
      loading.value = true;
      const id = formData.id;
      if (id) {
        CameraAPI.update(id, formData)
          .then(() => {
            ElMessage.success("修改成功");
            handleCloseDialog();
            handleResetQuery();
          })
          .finally(() => (loading.value = false));
      } else {
        CameraAPI.add(formData)
          .then(() => {
            ElMessage.success("新增成功");
            handleCloseDialog();
            handleResetQuery();
          })
          .finally(() => (loading.value = false));
      }
    }
  });
}

/** 关闭摄像头设备管理弹窗 */
function handleCloseDialog() {
  dialog.visible = false;
  dataFormRef.value.resetFields();
  dataFormRef.value.clearValidate();
  formData.id = undefined;
}

/** 删除摄像头设备管理 */
function handleDelete(id?: number) {
  const ids = [id || removeIds.value].join(",");
  if (!ids) {
    ElMessage.warning("请勾选删除项");
    return;
  }

  ElMessageBox.confirm("确认删除已选中的数据项?", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(
    () => {
      loading.value = true;
      CameraAPI.deleteByIds(ids)
        .then(() => {
          ElMessage.success("删除成功");
          handleResetQuery();
        })
        .finally(() => (loading.value = false));
    },
    () => {
      ElMessage.info("已取消删除");
    }
  );
}

onMounted(() => {
  handleQuery();
});
</script>
