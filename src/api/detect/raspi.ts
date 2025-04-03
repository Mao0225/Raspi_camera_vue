import request from "@/utils/request";

const RASPI_BASE_URL = "/api/v1/raspis";

const RaspiAPI = {
  /** 获取树莓派设备分页数据 */
  getPage(queryParams?: RaspiPageQuery) {
    return request<any, PageResult<RaspiPageVO[]>>({
      url: `${RASPI_BASE_URL}/page`,
      method: "get",
      params: queryParams,
    });
  },

  /** 获取树莓派下拉数据源 */
  getOptions() {
    return request<any, OptionType[]>({
      url: `${RASPI_BASE_URL}/options`,
      method: "get",
    });
  },
  /**
   * 获取树莓派设备表单数据
   *
   * @param id 树莓派设备ID
   * @returns 树莓派设备表单数据
   */
  getFormData(id: number) {
    return request<any, RaspiForm>({
      url: `${RASPI_BASE_URL}/${id}/form`,
      method: "get",
    });
  },

  /** 添加树莓派设备*/
  add(data: RaspiForm) {
    return request({
      url: `${RASPI_BASE_URL}`,
      method: "post",
      data: data,
    });
  },

  /**
   * 更新树莓派设备
   *
   * @param id 树莓派设备ID
   * @param data 树莓派设备表单数据
   */
  update(id: number, data: RaspiForm) {
    return request({
      url: `${RASPI_BASE_URL}/${id}`,
      method: "put",
      data: data,
    });
  },

  /**
   * 批量删除树莓派设备，多个以英文逗号(,)分割
   *
   * @param ids 树莓派设备ID字符串，多个以英文逗号(,)分割
   */
  deleteByIds(ids: string) {
    return request({
      url: `${RASPI_BASE_URL}/${ids}`,
      method: "delete",
    });
  },
};

export default RaspiAPI;

/** 树莓派设备分页查询参数 */
export interface RaspiPageQuery extends PageQuery {
  /** 编号 */
  serialNumber?: string;
  /** 放置地点 */
  location?: string;
}

/** 树莓派设备表单对象 */
export interface RaspiForm {
  /** id */
  id?: number;
  /** 编号 */
  serialNumber?: string;
  /** 所属部门id */
  deptId?: number;
  /** 放置地点 */
  location?: string;
  /** 上传间隔时间(秒) */
  uploadInterval?: number;
  /** 报警词汇 */
  alertKeywords?: string;
}

/** 树莓派设备分页对象 */
export interface RaspiPageVO {
  /** id */
  id?: number;
  /** 编号 */
  serialNumber?: string;
  /** 所属部门id */
  deptId?: number;
  /** 所属部门 */
  deptName?: string;
  /** 放置地点 */
  location?: string;
  /** 上传间隔时间(秒) */
  uploadInterval?: number;
  /** 报警词汇 */
  alertKeywords?: string;
  /** 创建时间 */
  createTime?: Date;
  /** 更新时间 */
  updateTime?: Date;
  /** 删除标记(0-未删除,1-已删除) */
  isDeleted?: number;
}
