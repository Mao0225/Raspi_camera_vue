<template>
  <div class="video-player-container">
    <div ref="playerContainer" class="player-wrapper"></div>
    <div v-if="loading" class="loading-overlay">
      <el-icon class="loading-icon"><Loading /></el-icon>
      <span>视频加载中...</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import { ElMessage } from "element-plus";
import { Loading } from "@element-plus/icons-vue";
import Hls from "hls.js";

const props = defineProps({
  src: {
    type: String,
    required: true,
  },
});

const playerContainer = ref<HTMLElement | null>(null);
const videoElement = ref<HTMLVideoElement | null>(null);
const hls = ref<Hls | null>(null);
const loading = ref<boolean>(true);

// 初始化HLS播放器
const initPlayer = () => {
  if (!playerContainer.value) return;

  // 销毁之前的播放器实例
  destroyPlayer();

  // 创建video元素
  videoElement.value = document.createElement("video");
  videoElement.value.className = "video-js";
  videoElement.value.controls = true;
  videoElement.value.autoplay = true;
  videoElement.value.style.width = "100%";
  videoElement.value.style.height = "100%";

  // 添加到容器中
  playerContainer.value.appendChild(videoElement.value);

  // 检查视频源
  if (!props.src) {
    loading.value = false;
    return;
  }

  loading.value = true;

  // 处理m3u8格式
  if (props.src.includes(".m3u8")) {
    if (Hls.isSupported()) {
      hls.value = new Hls({
        debug: false,
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      });

      hls.value.attachMedia(videoElement.value);
      hls.value.on(Hls.Events.MEDIA_ATTACHED, () => {
        hls.value?.loadSource(props.src);
      });

      hls.value.on(Hls.Events.MANIFEST_PARSED, () => {
        loading.value = false;
        videoElement.value?.play().catch((err) => {
          console.error("自动播放失败:", err);
          ElMessage.warning("自动播放失败，请手动点击播放");
        });
      });

      hls.value.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              // 尝试恢复网络错误
              console.log("致命网络错误，尝试恢复");
              hls.value?.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log("致命媒体错误，尝试恢复");
              hls.value?.recoverMediaError();
              break;
            default:
              // 无法恢复的错误
              destroyPlayer();
              ElMessage.error("视频播放出错，请刷新页面重试");
              break;
          }
        }
      });
    } else if (videoElement.value.canPlayType("application/vnd.apple.mpegurl")) {
      // 对于支持 HLS 的浏览器（如 Safari）
      videoElement.value.src = props.src;
      videoElement.value.addEventListener("loadedmetadata", () => {
        loading.value = false;
        videoElement.value?.play().catch(console.error);
      });
    } else {
      ElMessage.error("您的浏览器不支持HLS视频格式");
      loading.value = false;
    }
  } else {
    // 普通视频流
    videoElement.value.src = props.src;
    videoElement.value.addEventListener("loadeddata", () => {
      loading.value = false;
    });
    videoElement.value.addEventListener("error", () => {
      loading.value = false;
      ElMessage.error("视频加载失败");
    });
  }
};

// 销毁播放器
const destroyPlayer = () => {
  if (hls.value) {
    hls.value.destroy();
    hls.value = null;
  }

  if (videoElement.value) {
    videoElement.value.remove();
    videoElement.value = null;
  }

  if (playerContainer.value) {
    playerContainer.value.innerHTML = "";
  }
};

// 监听视频源变化
watch(
  () => props.src,
  () => {
    initPlayer();
  },
  { immediate: false }
);

onMounted(() => {
  initPlayer();
});

onBeforeUnmount(() => {
  destroyPlayer();
});
</script>

<style scoped>
.video-player-container {
  width: 100%;
  height: 100%;
  position: relative;
  background-color: #000;
  overflow: hidden;
}

.player-wrapper {
  width: 100%;
  height: 100%;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 14px;
}

.loading-icon {
  font-size: 32px;
  margin-bottom: 10px;
  animation: spin 1.5s infinite linear;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
