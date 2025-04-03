<template>
  <div class="app-container">
    <div class="search-bar">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item label="抓取时间" prop="grabTime">
          <el-date-picker
            v-model="queryParams.grabTime"
            type="daterange"
            range-separator="~"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
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
      <!-- <div class="mb-10px">
        <el-button v-hasPerm="['detect:snapshot:add']" type="success" @click="handleOpenDialog()">
          <template #icon><Plus /></template>
          新增
        </el-button>
        <el-button
          v-hasPerm="['detect:snapshot:delete']"
          type="danger"
          :disabled="removeIds.length === 0"
          @click="handleDelete()"
        >
          <template #icon><Delete /></template>
          删除
        </el-button>
      </div> -->

      <el-table
        ref="dataTableRef"
        v-loading="loading"
        :data="pageData"
        highlight-current-row
        border
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <!-- <el-table-column key="id" label="主键ID" prop="id" min-width="150" align="center" /> -->
        <el-table-column
          key="imagePath"
          label="图片"
          prop="imagePath"
          min-width="150"
          align="center"
        >
          <template #default="{ row }">
            <el-image
              style="width: 80px; height: 60px; object-fit: cover"
              :src="`http://39.98.221.201:8989${row.imagePath}`"
              :preview-src-list="[`http://39.98.221.201:8989${row.imagePath}`]"
              fit="cover"
              hide-on-click-modal
              :preview-teleported="true"
            >
              <template #error>
                <div class="image-error-placeholder">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-image>
          </template>
        </el-table-column>
        <el-table-column
          key="deviceNumber"
          label="设备编号"
          prop="deviceNumber"
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
        <el-table-column key="wet" label="湿度" prop="wet" min-width="50" align="center" />
        <el-table-column key="tem" label="温度" prop="tem" min-width="50" align="center" />
        <el-table-column
          key="info"
          label="照片描述信息"
          prop="info"
          min-width="150"
          align="center"
        />
        <el-table-column key="smoke" label="烟雾浓度" prop="smoke" min-width="150" align="center" />

        <el-table-column
          key="grabTime"
          label="抓取时间"
          prop="grabTime"
          min-width="150"
          align="center"
        />
        <el-table-column
          key="detectInfo"
          label="识别目标列表"
          prop="detectInfo"
          min-width="150"
          align="center"
        />
        <!-- <el-table-column fixed="right" label="操作" width="220">
          <template #default="scope">
            <el-button
              v-hasPerm="['detect:snapshot:edit']"
              type="primary"
              size="small"
              link
              @click="handleOpenDialog(scope.row.id)"
            >
              <template #icon><Edit /></template>
              编辑
            </el-button>
            <el-button
              v-hasPerm="['detect:snapshot:delete']"
              type="danger"
              size="small"
              link
              @click="handleDelete(scope.row.id)"
            >
              <template #icon><Delete /></template>
              删除
            </el-button>
          </template>
        </el-table-column> -->
      </el-table>

      <pagination
        v-if="total > 0"
        v-model:total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="handleQuery()"
      />
    </el-card>

    <!-- 摄像头抓拍记录表单弹窗 -->
    <el-dialog
      v-model="dialog.visible"
      :title="dialog.title"
      width="500px"
      @close="handleCloseDialog"
    >
      <el-form ref="dataFormRef" :model="formData" :rules="rules" label-width="100px">
        <el-form-item label="主键ID" prop="id">
          <el-input v-model="formData.id" placeholder="主键ID" />
        </el-form-item>

        <el-form-item label="设备编号" prop="deviceNumber">
          <el-input v-model="formData.deviceNumber" placeholder="设备编号" />
        </el-form-item>

        <el-form-item label="湿度" prop="wet">
          <el-input v-model="formData.wet" placeholder="湿度" />
        </el-form-item>

        <el-form-item label="温度" prop="tem">
          <el-input v-model="formData.tem" placeholder="温度" />
        </el-form-item>

        <el-form-item label="照片描述信息" prop="info">
          <el-input v-model="formData.info" placeholder="照片描述信息" />
        </el-form-item>

        <el-form-item label="烟雾浓度" prop="smoke">
          <el-input v-model="formData.smoke" placeholder="烟雾浓度" />
        </el-form-item>

        <el-form-item label="图片存储路径" prop="imagePath">
          <el-input v-model="formData.imagePath" placeholder="图片存储路径" />
        </el-form-item>

        <el-form-item label="抓取时间" prop="grabTime">
          <el-date-picker
            v-model="formData.grabTime"
            type="datetime"
            placeholder="抓取时间"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>

        <el-form-item label="识别出来的目标列表" prop="detectInfo">
          <el-input v-model="formData.detectInfo" placeholder="识别出来的目标列表" />
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
  name: "Snapshot",
  inheritAttrs: false,
});

import SnapshotAPI, {
  SnapshotPageVO,
  SnapshotForm,
  SnapshotPageQuery,
} from "@/api/detect/snapshot";

const queryFormRef = ref();
const dataFormRef = ref();

const loading = ref(false);
const removeIds = ref<number[]>([]);
const total = ref(0);

const queryParams = reactive<SnapshotPageQuery>({
  pageNum: 1,
  pageSize: 10,
});

// 摄像头抓拍记录表格数据
const pageData = ref<SnapshotPageVO[]>([]);

// 弹窗
const dialog = reactive({
  title: "",
  visible: false,
});

// 摄像头抓拍记录表单数据
const formData = reactive<SnapshotForm>({});

// 摄像头抓拍记录表单校验规则
const rules = reactive({
  deviceNumber: [{ required: true, message: "请输入设备编号", trigger: "blur" }],
  grabTime: [{ required: true, message: "请输入抓取时间", trigger: "blur" }],
});

/** 查询摄像头抓拍记录 */
function handleQuery() {
  loading.value = true;
  SnapshotAPI.getPage(queryParams)
    .then((data) => {
      pageData.value = data.list;
      total.value = data.total;
    })
    .finally(() => {
      loading.value = false;
    });
}

/** 重置摄像头抓拍记录查询 */
function handleResetQuery() {
  queryFormRef.value!.resetFields();
  queryParams.pageNum = 1;
  handleQuery();
}

/** 行复选框选中记录选中ID集合 */
function handleSelectionChange(selection: any) {
  removeIds.value = selection.map((item: any) => item.id);
}

/** 打开摄像头抓拍记录弹窗 */
function handleOpenDialog(id?: number) {
  dialog.visible = true;
  if (id) {
    dialog.title = "修改摄像头抓拍记录";
    SnapshotAPI.getFormData(id).then((data) => {
      Object.assign(formData, data);
    });
  } else {
    dialog.title = "新增摄像头抓拍记录";
  }
}

/** 提交摄像头抓拍记录表单 */
function handleSubmit() {
  dataFormRef.value.validate((valid: any) => {
    if (valid) {
      loading.value = true;
      const id = formData.id;
      if (id) {
        SnapshotAPI.update(id, formData)
          .then(() => {
            ElMessage.success("修改成功");
            handleCloseDialog();
            handleResetQuery();
          })
          .finally(() => (loading.value = false));
      } else {
        SnapshotAPI.add(formData)
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

/** 关闭摄像头抓拍记录弹窗 */
function handleCloseDialog() {
  dialog.visible = false;
  dataFormRef.value.resetFields();
  dataFormRef.value.clearValidate();
  formData.id = undefined;
}

/** 删除摄像头抓拍记录 */
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
      SnapshotAPI.deleteByIds(ids)
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
