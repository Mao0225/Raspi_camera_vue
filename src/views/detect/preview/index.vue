<template>
  <div class="container">
    <div class="main-content">
      <!-- 左侧树形选择器 -->
      <div class="left-sidebar">
        <el-card shadow="never" class="raspi-tree-card">
          <el-input v-model="searchRaspi" placeholder="搜索设备" clearable>
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>

          <div class="raspi-tree-header">
            <span>设备列表</span>
            <el-button
              type="primary"
              :icon="Refresh"
              circle
              size="small"
              :loading="loadingRaspi"
              @click="loadRaspiOptions"
            />
          </div>

          <el-scrollbar height="calc(100vh - 230px)">
            <div class="raspi-list">
              <div
                v-for="item in filteredRaspiOptions"
                :key="item.value"
                class="raspi-item"
                :class="{ active: selectedRaspi === item.value }"
                @click="handleRaspiItemClick(item.value)"
              >
                <el-icon class="raspi-icon"><Connection /></el-icon>
                <span class="raspi-label">{{ item.label }}</span>
                <el-icon v-if="selectedRaspi === item.value" class="check-icon"><Check /></el-icon>
              </div>
            </div>
          </el-scrollbar>
        </el-card>
      </div>

      <!-- 中间部分 -->
      <div class="center-section">
        <!-- 主视频播放器 -->
        <div class="main-player">
          <video-player
            v-if="currentCamera"
            :src="currentCamera.videoUrl"
            class="main-video-player"
          />
          <div v-else class="no-video">
            <el-empty description="暂无视频" />
          </div>
        </div>

        <!-- 底部预览缩略图 -->
        <div class="thumbnails">
          <div
            v-for="(camera, index) in cameraList"
            :key="index"
            class="thumbnail-item"
            :class="{ active: currentIndex === index }"
            @click="switchCamera(index)"
          >
            <el-image
              :src="`http://39.98.221.201:8989${camera.imagePath}`"
              fit="cover"
              class="thumbnail-image"
            >
              <template #error>
                <div class="image-error">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-image>
            <div class="thumbnail-overlay">
              <span>{{ camera.deviceNumber || `摄像头 ${index + 1}` }}</span>
            </div>
          </div>
        </div>
      </div>
      <!-- 右侧信息部分：显示所有摄像头信息 -->
      <div class="right-section">
        <el-scrollbar height="100%">
          <div v-if="cameraList.length > 0">
            <el-card
              v-for="(camera, index) in cameraList"
              :key="index"
              class="camera-info-card"
              :class="{ 'active-card': currentIndex === index }"
              shadow="hover"
            >
              <template #header>
                <div class="card-header">
                  <div class="card-title">
                    <h3>{{ camera.deviceNumber || `摄像头 ${index + 1}` }}</h3>
                    <el-tag
                      size="small"
                      :type="currentIndex === index ? 'primary' : 'info'"
                      effect="dark"
                    >
                      {{ currentIndex === index ? "当前播放" : "点击预览查看" }}
                    </el-tag>
                  </div>
                  <el-button type="primary" size="small" circle @click="switchCamera(index)">
                    <el-icon>
                      <component :is="currentIndex === index ? 'VideoPlay' : 'VideoPause'" />
                    </el-icon>
                  </el-button>
                </div>
              </template>

              <div class="sensor-stats">
                <div class="sensor-item">
                  <div class="sensor-icon">
                    <el-icon><Odometer /></el-icon>
                  </div>
                  <div class="sensor-details">
                    <div class="sensor-label">温度</div>
                    <div class="sensor-value">
                      <el-tag type="danger" effect="dark">{{ camera.tem || "N/A" }}</el-tag>
                    </div>
                  </div>
                </div>

                <div class="sensor-item">
                  <div class="sensor-icon">
                    <el-icon><Drizzling /></el-icon>
                  </div>
                  <div class="sensor-details">
                    <div class="sensor-label">湿度</div>
                    <div class="sensor-value">
                      <el-tag type="info" effect="dark">{{ camera.wet || "N/A" }}</el-tag>
                    </div>
                  </div>
                </div>

                <div class="sensor-item">
                  <div class="sensor-icon">
                    <el-icon><WindPower /></el-icon>
                  </div>
                  <div class="sensor-details">
                    <div class="sensor-label">烟雾浓度</div>
                    <div class="sensor-value">
                      <el-tag type="warning" effect="dark">{{ camera.smoke || "N/A" }}</el-tag>
                    </div>
                  </div>
                </div>
              </div>

              <el-divider class="divider-slim" />

              <div class="camera-details">
                <div class="detail-item">
                  <div class="detail-label">
                    <el-icon><Timer /></el-icon>
                    <span>抓取时间</span>
                  </div>
                  <div class="detail-value time-value">{{ formatTime(camera.grabTime) }}</div>
                </div>

                <el-divider class="divider-slim" />

                <div class="detail-item">
                  <div class="detail-label">
                    <el-icon><InfoFilled /></el-icon>
                    <span>信息</span>
                  </div>
                  <div class="detail-value description-text">
                    {{ camera.info || "暂无描述" }}
                  </div>
                </div>

                <el-divider class="divider-slim" />

                <div class="detail-item">
                  <div class="detail-label">
                    <el-icon><Aim /></el-icon>
                    <span>识别目标</span>
                  </div>
                  <div class="detail-value">
                    <div v-if="camera.detectInfo" class="detect-tags">
                      <el-tag
                        v-for="(target, idx) in parseDetectInfo(camera.detectInfo)"
                        :key="idx"
                        size="small"
                        type="success"
                        effect="light"
                        class="detect-tag"
                      >
                        {{ target }}
                      </el-tag>
                    </div>
                    <div v-else class="no-detect">暂无识别目标</div>
                  </div>
                </div>
              </div>
            </el-card>
          </div>

          <el-empty v-else description="暂无摄像头数据" />
        </el-scrollbar>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed, watch } from "vue";
import { ElMessage } from "element-plus";
import {
  Picture,
  Odometer,
  InfoFilled,
  Drizzling,
  Timer,
  Aim,
  WindPower,
  VideoPause,
  VideoPlay,
  Connection,
  Refresh,
  Search,
  Check,
} from "@element-plus/icons-vue";
import VideoPlayer from "./components/VideoPlayer.vue";
import CameraAPI from "@/api/detect/camera";
import RaspiAPI from "@/api/detect/raspi";

// 树莓派选项接口
interface RaspiOption {
  value: number;
  label: string;
  [key: string]: any;
}

// 摄像头视频预览对象接口
interface CameraPreviewVO {
  /** 设备编号 */
  deviceNumber?: string;
  /** 视频流地址 */
  videoUrl?: string;
  /** 湿度 */
  wet?: string;
  /** 温度 */
  tem?: string;
  /** 照片描述信息 */
  info?: string;
  /** 烟雾浓度 */
  smoke?: string;
  /** 图片存储路径 */
  imagePath?: string;
  /** 抓取时间 */
  grabTime?: Date;
  /** 识别出来的目标列表 */
  detectInfo?: string;
}

// 数据定义
const cameraList = ref<CameraPreviewVO[]>([]);
const currentIndex = ref<number>(0);
const loading = ref<boolean>(false);
const loadingRaspi = ref<boolean>(false);
const raspiOptions = ref<RaspiOption[]>([]);
const selectedRaspi = ref<number | null>(null);
const searchRaspi = ref<string>("");

// 过滤后的树莓派选项
const filteredRaspiOptions = computed(() => {
  if (!searchRaspi.value) {
    return raspiOptions.value;
  }
  return raspiOptions.value.filter((item) =>
    item.label.toLowerCase().includes(searchRaspi.value.toLowerCase())
  );
});

// 计算当前选中的摄像头
const currentCamera = computed<CameraPreviewVO | null>(() => {
  return cameraList.value.length > 0 ? cameraList.value[currentIndex.value] : null;
});

// 处理树莓派项点击
const handleRaspiItemClick = (value: number) => {
  if (selectedRaspi.value !== value) {
    selectedRaspi.value = value;
    // 重置当前选中的摄像头索引
    currentIndex.value = 0;
    // 加载与所选树莓派关联的摄像头
    fetchCameraData(value);
  }
};

// 切换摄像头
const switchCamera = (index: number) => {
  if (index >= 0 && index < cameraList.value.length) {
    currentIndex.value = index;
  }
};

// 格式化时间
const formatTime = (time?: Date): string => {
  if (!time) return "N/A";

  const date = new Date(time);
  if (isNaN(date.getTime())) return "N/A";

  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

// 解析识别信息为标签数组
const parseDetectInfo = (info?: string): string[] => {
  if (!info) return [];

  // 根据实际数据格式调整分割逻辑
  // 假设detectInfo是逗号分隔的字符串
  return info
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item);
};

// 加载树莓派选项
const loadRaspiOptions = async () => {
  try {
    loadingRaspi.value = true;
    const options = await RaspiAPI.getOptions();

    // 确保所有value都是数字类型
    raspiOptions.value = options.map((item) => ({
      ...item,
      value: Number(item.value), // 强制转为数字
    }));

    // 如果有选项，默认选择第一个
    if (raspiOptions.value.length > 0 && !selectedRaspi.value) {
      selectedRaspi.value = raspiOptions.value[0].value;
      fetchCameraData(raspiOptions.value[0].value);
    }
  } catch (error) {
    console.error("获取树莓派选项失败:", error);
    ElMessage.error("获取树莓派选项失败");
  } finally {
    loadingRaspi.value = false;
  }
};

// 刷新数据
const refreshData = () => {
  if (selectedRaspi.value !== null) {
    fetchCameraData(selectedRaspi.value);
  } else {
    ElMessage.warning("请先选择树莓派设备");
  }
};

// 获取摄像头数据
const fetchCameraData = async (raspiId?: number) => {
  try {
    loading.value = true;
    // 使用所选的树莓派ID，如果没有提供则使用当前选中的ID
    const id = raspiId !== undefined ? raspiId : selectedRaspi.value;

    if (id === null) {
      ElMessage.warning("请选择树莓派设备");
      return;
    }

    const res = await CameraAPI.getPreviewData(id);
    if (res && Array.isArray(res) && res.length > 0) {
      cameraList.value = res;
      currentIndex.value = 0;
    } else {
      cameraList.value = [];
      ElMessage.warning(`树莓派设备 ${id} 没有关联的摄像头数据`);
    }
  } catch (error) {
    console.error("获取摄像头数据失败:", error);
    ElMessage.error("获取摄像头数据失败");
    cameraList.value = [];
  } finally {
    loading.value = false;
  }
};

// 监听树莓派选择变化
watch(selectedRaspi, (newValue) => {
  if (newValue !== null) {
    fetchCameraData(newValue);
  }
});

// 页面加载时获取数据
onMounted(async () => {
  // 加载树莓派选项
  await loadRaspiOptions();

  // 定时刷新数据 (每60秒刷新一次)
  const refreshInterval = setInterval(() => {
    if (selectedRaspi.value !== null) {
      fetchCameraData(selectedRaspi.value);
    }
  }, 60000);

  // 组件卸载时清除定时器
  return () => {
    clearInterval(refreshInterval);
  };
});
</script>

<style scoped>
.container {
  height: 100%;
  /* width: 200%; */
  max-width: 1800px;
}

.main-content {
  display: flex;
  height: 100%;
  gap: 10px;
}

.raspi-tree-card {
  height: 100%;
}

.raspi-tree-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 12px 0;
  font-weight: 500;
}

.raspi-list {
  margin-top: 10px;
}

.raspi-item {
  display: flex;
  align-items: center;
  padding: 12px 10px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 4px;
  position: relative;
}

.raspi-item:hover {
  background-color: #f5f7fa;
}

.raspi-item.active {
  background-color: #ecf5ff;
  color: #409eff;
}

.raspi-icon {
  margin-right: 10px;
  font-size: 16px;
  color: #409eff;
}

.raspi-label {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.check-icon {
  position: absolute;
  right: 10px;
  color: #409eff;
}

/* 左侧侧边栏样式 */
.left-sidebar {
  flex: 0 0 250px;
  transition: all 0.3s;
}

/* 中间部分样式 */
.center-section {
  flex: 3;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.right-section {
  flex: 2;
  min-width: 200px;
  max-width: 350px;
  overflow: hidden;
}

.main-player {
  flex: 1;
  background-color: #000;
  position: relative;
  border-radius: 4px;
  overflow: hidden;
}

.main-video-player {
  width: 100%;
  height: 100%;
}

.no-video {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background-color: #f5f7fa;
}

.thumbnails {
  display: flex;
  height: 120px;
  gap: 10px;
  overflow-x: auto;
}

.thumbnail-item {
  flex: 0 0 200px;
  height: 120px;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.3s;
}

.thumbnail-item.active {
  border-color: #409eff;
}

.thumbnail-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnail-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 4px 8px;
  font-size: 12px;
}

/* 右侧样式更新 */
.camera-info-card {
  margin-bottom: 16px;
  border: 1px solid #ebeef5;
  transition: all 0.3s;
  overflow: hidden;
}

.camera-info-card.active-card {
  border-color: #409eff;
  box-shadow: 0 2px 12px 0 rgba(64, 158, 255, 0.2);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-title h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}

.playing-btn {
  transform: scale(1.1);
}

/* 传感器数据区域 */
.sensor-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.sensor-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px;
  flex: 1;
  text-align: center;
  border-radius: 4px;
  background-color: #f8f9fa;
}

.sensor-icon {
  font-size: 22px;
  margin-bottom: 4px;
  color: #606266;
}

.sensor-details {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.sensor-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.divider-slim {
  margin: 10px 0;
}

/* 相机详细信息区域 */
.camera-details {
  font-size: 14px;
}

.detail-item {
  margin-bottom: 8px;
}

.detail-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
  color: #606266;
  margin-bottom: 4px;
}

.detail-value {
  padding-left: 24px;
  color: #303133;
}

.time-value {
  font-family: monospace;
  color: #409eff;
}

.description-text,
.detect-info {
  white-space: pre-line;
  font-size: 13px;
  line-height: 1.5;
  color: #606266;
}

.detect-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.detect-tag {
  margin-right: 0;
}

.no-detect {
  color: #909399;
  font-style: italic;
  font-size: 13px;
}

.image-error {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: #f5f7fa;
  color: #909399;
  font-size: 20px;
}
</style>
