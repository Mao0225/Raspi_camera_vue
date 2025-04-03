import request from "@/utils/request";

const SNAPSHOT_BASE_URL = "/api/v1/snapshots";

const SnapshotAPI = {
  /** 获取摄像头抓拍记录分页数据 */
  getPage(queryParams?: SnapshotPageQuery) {
    return request<any, PageResult<SnapshotPageVO[]>>({
      url: `${SNAPSHOT_BASE_URL}/page`,
      method: "get",
      params: queryParams,
    });
  },
  /**
   * 获取摄像头抓拍记录表单数据
   *
   * @param id 摄像头抓拍记录ID
   * @returns 摄像头抓拍记录表单数据
   */
  getFormData(id: number) {
    return request<any, SnapshotForm>({
      url: `${SNAPSHOT_BASE_URL}/${id}/form`,
      method: "get",
    });
  },

  /** 添加摄像头抓拍记录*/
  add(data: SnapshotForm) {
    return request({
      url: `${SNAPSHOT_BASE_URL}`,
      method: "post",
      data: data,
    });
  },

  /**
   * 更新摄像头抓拍记录
   *
   * @param id 摄像头抓拍记录ID
   * @param data 摄像头抓拍记录表单数据
   */
  update(id: number, data: SnapshotForm) {
    return request({
      url: `${SNAPSHOT_BASE_URL}/${id}`,
      method: "put",
      data: data,
    });
  },

  /**
   * 批量删除摄像头抓拍记录，多个以英文逗号(,)分割
   *
   * @param ids 摄像头抓拍记录ID字符串，多个以英文逗号(,)分割
   */
  deleteByIds(ids: string) {
    return request({
      url: `${SNAPSHOT_BASE_URL}/${ids}`,
      method: "delete",
    });
  },
};

export default SnapshotAPI;

/** 摄像头抓拍记录分页查询参数 */
export interface SnapshotPageQuery extends PageQuery {
  /** 抓取时间 */
  grabTime?: [string, string];
}

/** 摄像头抓拍记录表单对象 */
export interface SnapshotForm {
  /** 主键ID */
  id?: number;
  /** 设备编号 */
  deviceNumber?: string;
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

/** 摄像头抓拍记录分页对象 */
export interface SnapshotPageVO {
  /** 主键ID */
  id?: number;
  /** 设备编号 */
  deviceNumber?: string;
  /** 部门 */
  deptName?: string;
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
  /** 创建时间 */
  createTime?: Date;
  /** 更新时间 */
  updateTime?: Date;
  /** 逻辑删除标记(0:未删除 1:已删除) */
  isDeleted?: number;
}
