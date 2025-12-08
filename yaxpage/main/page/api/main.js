// 日常处理情况统计
export const getStatisticsData = async () => {
  const url = `${top.pathConfig.gateway}/aud/select/getStatisticsData`;
  const req = {
    serviceName: "getStatisticsData",
    colNames: ["*"],
    page: {
      rownumber: 3,
    },
  };
  return new Promise((resolve) => {
    const mockData = [
      {
        name: "待处理工单",
        number: 1921,
      },
      {
        name: "已处理工单",
        number: 6513,
      },
      {
        name: "最新信息",
        number: 633,
      },
    ];
    resolve({
      data: mockData,
      page: {
        pageNo: 1,
        rownumber: 3,
        total: 3,
      },
    });
    crosAjax(url, "POST", req, (data) => {
      console.log("日常处理情况统计:", data);
      resolve(data);
    });
  });
};

// 我的待办
export const getTodos = async (type) => {
  const url = `${top.pathConfig.gateway}/aud/select/getTodos`;
  const req = {
    serviceName: "getTodos",
    colNames: ["*"],
    page: {
      rownumber: 6,
    },
  };
  if (type) {
    req.condition = [{ colName: "type", ruleType: "eq", value: type }];
  }
  return new Promise((resolve) => {
    crosAjax(url, "POST", req, (data) => {
      console.log("日常处理情况统计:", data);
      resolve(data);
    });
  });
};

// 收费稽核政策
export const policyService = "srvaud_sfjhzc_select";
export const getPolicy = async () => {
  const url = `${top.pathConfig.gateway}/aud/select/${policyService}`;
  const req = {
    serviceName: policyService,
    colNames: ["*"],
    page: {
      rownumber: 5,
    },
  };
  return new Promise((resolve) => {
    crosAjax(url, "POST", req, (data) => {
      console.log("收费稽核政策:", data);
      resolve(data);
    });
  });
};

const downloadPolicyService = "srvaud_infoattachment_select";
export const getPolicyFile = async (infoid) => {
  if (!infoid) {
    return;
  }
  const url = `${top.pathConfig.gateway}/aud/select/${downloadPolicyService}`;
  const req = {
    serviceName: downloadPolicyService,
    colNames: ["*"],
    condition: [{ colName: "infoid", ruleType: "eq", value: infoid }],
    page: { pageNo: 1, rownumber: 5 },
  };
  const res = await new Promise((resolve) => {
    crosAjax(url, "POST", req, (data) => {
      console.log("收费稽核政策文件:", data);
      resolve(data);
    });
  });
  return res?.data;
};

function downloadFile(url, filename) {
  var ele = document.createElement("a");
  ele.download = filename; // 设置下载的文件名
  ele.href = url;
  document.body.appendChild(ele);
  ele.click();
  ele.remove(); // 下载之后把创建的元素删除
}

export const downloadPolicyFile = async (data) => {
  const files = await getPolicyFile(data?.infoid);
  if (Array.isArray(files) && files.length > 0) {
    files.forEach((item) => {
      const url = `${top.pathConfig.gateway}/file/select/srvfile_attachment_select`;
      const req = {
        serviceName: "srvfile_attachment_select",
        colNames: ["*"],
        condition: [
          { colName: "file_no", value: item.info_file, ruleType: "eq" },
        ],
      };
      crosAjax(url, "POST", req, (data) => {
        if (Array.isArray(data.data) && data.data.length > 0) {
          const file = data.data[0];
          const fileUrl = `${
            top.pathConfig.gateway
          }/file/download?bx_auth_ticket=${sessionStorage.getItem(
            "bx_auth_ticket"
          )}&filePath=${file.fileurl}`;
          downloadFile(fileUrl, file.src_name);
          // window.open(fileUrl);
        }
      });
      // window.open(
      //   `${
      //     top.pathConfig.gateway
      //   }/file/download?bx_auth_ticket=${sessionStorage.getItem(
      //     "bx_auth_ticket"
      //   )}&fileNo=${item.info_file}`
      // );
    });
  } else {
    alert("没有可下载附件");
  }
};

// 学习材料
export const materiaService = "srvaud_xxcl_select";
export const getMateria = async () => {
  const url = `${top.pathConfig.gateway}/aud/select/${materiaService}`;
  const req = {
    serviceName: materiaService,
    colNames: ["*"],
    page: {
      rownumber: 6,
    },
  };
  return new Promise((resolve) => {
    crosAjax(url, "POST", req, (data) => {
      console.log("学习材料:", data);
      resolve(data);
    });
  });
};

// 待处理嫌疑车辆
// export const waitCarService = "srvaud_susvehicle_todo_select";
export const waitCarService = "srvaud_susvehpass_todo_select";
// export const waitCarService = "srvaud_susvehpass_todo_select";
export const getWaitCar = async () => {
  const url = `${top.pathConfig.gateway}/aud/select/${waitCarService}`;
  const req = {
    serviceName: waitCarService,
    colNames: ["*"],
    page: {
      rownumber: 5,
    },
  };
  return new Promise((resolve) => {
    crosAjax(url, "POST", req, (data) => {
      console.log("待处理嫌疑车辆:", data);
      resolve(data);
    });
  });
};

// 通知公告
export const noticeService = "srvaud_tzgg_select";
export const getNotice = async () => {
  const url = `${top.pathConfig.gateway}/aud/select/${noticeService}`;
  const req = {
    serviceName: noticeService,
    colNames: ["*"],
    page: {
      rownumber: 8,
    },
  };
  return new Promise((resolve) => {
    crosAjax(url, "POST", req, (data) => {
      console.log("通知公告:", data);
      resolve(data);
    });
  });
};

// 我的待办
// export const todoService = "srvaud_susvehpass_todo_select";
export const todoService = "srvaud_susvehpass_his_select";
// export const todoService = "srvaud_susvehicle_select";
export const getTotoList = async (type) => {
  const url = `${top.pathConfig.gateway}/aud/select/${todoService}`;
  const req = {
    serviceName: todoService,
    colNames: ["*"],
    condition: [],
    page: {
      rownumber: 6,
    },
  };
  if (type && type !== "全部") {
    req.condition = [
      {
        colName: "handle_result",
        ruleType: "eq",
        value: type === "已推送" ? "1" : "2",
        // value: type === "已推送" ? "推送省级稽核平台" : "未推送省级稽核平台",
      },
    ];
  }
  req.condition.push({
    colName: "handle_result",
    ruleType: "notnull",
  });
  return new Promise((resolve) => {
    crosAjax(url, "POST", req, (data) => {
      console.log("我的待办:", data);
      if (data?.data?.length) {
        data.data = data.data.map((item) => {
          item.name = item.remark;
          return item;
        });
      }
      resolve(data);
    });
  });
};

// 待处理工单
export const getTodoNum = () => {
  // const service = "srvaud_susvehicle_cnt_select";
  const service = "srvaud_susvehpass_cnt_select";
  // const service = "srvaud_susvehicle_select";
  const url = `${top.pathConfig.gateway}/aud/select/${service}`;
  const req = {
    serviceName: service,
    colNames: ["*"],
    condition: [],
    page: { pageNo: 1, rownumber: 10 },
    // group: [
    //   {
    //     colName: "handle_result",
    //     type: "by",
    //   },
    //   { colName: "id", type: "count" },
    // ],
  };
  return new Promise((resolve) => {
    crosAjax(url, "POST", req, (data) => {
      console.log("我的待办:", data);
      if (data?.data?.length) {
        data.data = data.data.map((item) => {
          item.name = item.remark;
          return item;
        });
      }
      resolve(data);
    });
  });
};
