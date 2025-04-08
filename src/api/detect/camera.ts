import request from "@/utils/request";

const CAMERA_BASE_URL = "/api/v1/cameras";

const CameraAPI = {
  /** 获取摄像头设备管理分页数据 */
  getPage(queryParams?: CameraPageQuery) {
    return request<any, PageResult<CameraPageVO[]>>({
      url: `${CAMERA_BASE_URL}/page`,
      method: "get",
      params: queryParams,
    });
  },
  /**
   * 获取摄像头设备管理表单数据
   *
   * @param id 摄像头设备管理ID
   * @returns 摄像头设备管理表单数据
   */
  getFormData(id: number) {
    return request<any, CameraForm>({
      url: `${CAMERA_BASE_URL}/${id}/form`,
      method: "get",
    });
  },
  /**
   * 获取摄像头预览数据
   *
   * @param raspiId 树莓派Id
   * @returns 获取摄像头预览数据
   */
  getPreviewData(raspiId: number) {
    return request<any, CameraPreviewVO>({
      url: `${CAMERA_BASE_URL}/preview/${raspiId}`,
      method: "get",
    });
  },

  /** 添加摄像头设备管理*/
  add(data: CameraForm) {
    return request({
      url: `${CAMERA_BASE_URL}`,
      method: "post",
      data: data,
    });
  },

  /**
   * 更新摄像头设备管理
   *
   * @param id 摄像头设备管理ID
   * @param data 摄像头设备管理表单数据
   */
  update(id: number, data: CameraForm) {
    return request({
      url: `${CAMERA_BASE_URL}/${id}`,
      method: "put",
      data: data,
    });
  },

  /**
   * 批量删除摄像头设备管理，多个以英文逗号(,)分割
   *
   * @param ids 摄像头设备管理ID字符串，多个以英文逗号(,)分割
   */
  deleteByIds(ids: string) {
    return request({
      url: `${CAMERA_BASE_URL}/${ids}`,
      method: "delete",
    });
  },
};

export default CameraAPI;

/** 摄像头设备管理分页查询参数 */
export interface CameraPageQuery extends PageQuery {}

/** 摄像头设备管理表单对象 */
export interface CameraForm {
  /** 主键ID */
  id?: number;
  /** 视频流地址 */
  videoUrl?: string;
  /** 摄像头编号 */
  deviceNumber?: number;
  /** 所属树莓派ID */
  raspberryPiId?: number;
  /** 放置地点 */
  location?: string;
}

/** 摄像头视频预览对象 */
export interface CameraPreviewVO {
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

/** 摄像头设备管理分页对象 */
export interface CameraPageVO {
  /** 主键ID */
  id?: number;
  /** 视频流地址 */
  videoUrl?: string;
  /** 摄像头编号 */
  deviceNumber?: string;
  /** 所属树莓派ID */
  raspberryPiId?: number;
  /** 所属树莓派编号 */
  raspiNumber?: string;
  /** 所属部门名称 */
  deptName?: string;
  /** 放置地点 */
  location?: string;
  /** 创建时间 */
  createTime?: Date;
  /** 更新时间 */
  updateTime?: Date;
  /** 删除标记(0:未删除 1:已删除) */
  isDeleted?: number;
}
