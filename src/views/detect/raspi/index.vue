<template>
  <div class="app-container">
    <div class="search-bar">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item label="编号" prop="serialNumber">
          <el-input
            v-model="queryParams.serialNumber"
            placeholder="编号"
            clearable
            @keyup.enter="handleQuery()"
          />
        </el-form-item>
        <el-form-item label="放置地点" prop="location">
          <el-input
            v-model="queryParams.location"
            placeholder="放置地点"
            clearable
            @keyup.enter="handleQuery()"
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
      <div class="mb-10px">
        <el-button v-hasPerm="['detect:raspi:add']" type="success" @click="handleOpenDialog()">
          <template #icon><Plus /></template>
          新增
        </el-button>
        <el-button
          v-hasPerm="['detect:raspi:delete']"
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
        <!-- <el-table-column key="id" label="id" prop="id" min-width="150" align="center" /> -->
        <el-table-column
          key="serialNumber"
          label="编号"
          prop="serialNumber"
          min-width="150"
          align="center"
        />

        <el-table-column label="部门" width="120" align="center" prop="deptName" />
        <el-table-column
          key="location"
          label="放置地点"
          prop="location"
          min-width="150"
          align="center"
        />
        <el-table-column
          key="uploadInterval"
          label="上传间隔时间(秒)"
          prop="uploadInterval"
          min-width="150"
          align="center"
        />
        <el-table-column
          key="alertKeywords"
          label="报警词汇"
          prop="alertKeywords"
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
        <!-- <el-table-column
          key="isDeleted"
          label="删除标记(0-未删除,1-已删除)"
          prop="isDeleted"
          min-width="150"
          align="center"
        /> -->
        <el-table-column fixed="right" label="操作" width="220">
          <template #default="scope">
            <el-button
              v-hasPerm="['detect:raspi:edit']"
              type="primary"
              size="small"
              link
              @click="handleOpenDialog(scope.row.id)"
            >
              <template #icon><Edit /></template>
              编辑
            </el-button>
            <el-button
              v-hasPerm="['detect:raspi:delete']"
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

    <!-- 树莓派设备表单弹窗 -->
    <el-dialog
      v-model="dialog.visible"
      :title="dialog.title"
      width="500px"
      @close="handleCloseDialog"
    >
      <el-form ref="dataFormRef" :model="formData" :rules="rules" label-width="100px">
        <!-- <el-form-item label="id" prop="id">
          <el-input v-model="formData.id" placeholder="id" />
        </el-form-item> -->

        <el-form-item label="编号" prop="serialNumber">
          <el-input v-model="formData.serialNumber" placeholder="编号" />
        </el-form-item>

        <el-form-item label="所属部门" prop="deptId">
          <el-tree-select
            v-model="formData.deptId"
            placeholder="请选择所属部门"
            :data="deptOptions"
            filterable
            check-strictly
            :render-after-expand="false"
          />
        </el-form-item>

        <el-form-item label="放置地点" prop="location">
          <el-input v-model="formData.location" placeholder="放置地点" />
        </el-form-item>

        <el-form-item label="间隔时间" prop="uploadInterval">
          <el-input v-model="formData.uploadInterval" placeholder="上传间隔时间(秒)" />
        </el-form-item>

        <el-form-item label="报警词汇" prop="alertKeywords">
          <el-input v-model="formData.alertKeywords" placeholder="报警词汇" />
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
  name: "Raspi",
  inheritAttrs: false,
});

import RaspiAPI, { RaspiPageVO, RaspiForm, RaspiPageQuery } from "@/api/detect/raspi";
import DeptAPI from "@/api/system/dept.api";

const queryFormRef = ref();
const dataFormRef = ref();

const loading = ref(false);
const removeIds = ref<number[]>([]);
const total = ref(0);

const deptOptions = ref<OptionType[]>();

const queryParams = reactive<RaspiPageQuery>({
  pageNum: 1,
  pageSize: 10,
});

// 树莓派设备表格数据
const pageData = ref<RaspiPageVO[]>([]);

// 弹窗
const dialog = reactive({
  title: "",
  visible: false,
});

// 树莓派设备表单数据
const formData = reactive<RaspiForm>({});

// 树莓派设备表单校验规则
const rules = reactive({
  serialNumber: [{ required: true, message: "请输入编号", trigger: "blur" }],
  deptId: [{ required: true, message: "请输入所属部门id", trigger: "blur" }],
  location: [{ required: true, message: "请输入放置地点", trigger: "blur" }],
  uploadInterval: [{ required: true, message: "请输入上传间隔时间(秒)", trigger: "blur" }],
});

/** 查询树莓派设备 */
function handleQuery() {
  loading.value = true;
  RaspiAPI.getPage(queryParams)
    .then((data) => {
      pageData.value = data.list;
      total.value = data.total;
    })
    .finally(() => {
      loading.value = false;
    });
}

/** 重置树莓派设备查询 */
function handleResetQuery() {
  queryFormRef.value!.resetFields();
  queryParams.pageNum = 1;
  handleQuery();
}

/** 行复选框选中记录选中ID集合 */
function handleSelectionChange(selection: any) {
  removeIds.value = selection.map((item: any) => item.id);
}

/** 打开树莓派设备弹窗 */
async function handleOpenDialog(id?: number) {
  deptOptions.value = (await DeptAPI.getOptions()).map((item) => ({
    ...item,
    value: Number(item.value), // 强制转为数字
  }));
  dialog.visible = true;
  if (id) {
    dialog.title = "修改树莓派设备";
    RaspiAPI.getFormData(id).then((data) => {
      Object.assign(formData, data);
    });
  } else {
    dialog.title = "新增树莓派设备";
  }
}

/** 提交树莓派设备表单 */
function handleSubmit() {
  dataFormRef.value.validate((valid: any) => {
    if (valid) {
      loading.value = true;
      const id = formData.id;
      if (id) {
        RaspiAPI.update(id, formData)
          .then(() => {
            ElMessage.success("修改成功");
            handleCloseDialog();
            handleResetQuery();
          })
          .finally(() => (loading.value = false));
      } else {
        RaspiAPI.add(formData)
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

/** 关闭树莓派设备弹窗 */
function handleCloseDialog() {
  dialog.visible = false;
  dataFormRef.value.resetFields();
  dataFormRef.value.clearValidate();
  formData.id = undefined;
}

/** 删除树莓派设备 */
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
      RaspiAPI.deleteByIds(ids)
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
