
const genReq = (appConfig) => {
  return {
    getAllChannel(sid) {
      const url = `${appConfig.h5Service}/channel/list?sid=${sid}`;
      return fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
    },

    querySelectedChannel(sid, keyword) {
      const url = `${appConfig.h5Service}/channel/${sid}/select?keyword=${keyword}`;
      return fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
    },

    addCustomChannel(data) {
      const url = `${appConfig.h5Service}/channel`;
      return fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });
    },

    delCustomChannel(cid) {
      const url = `${appConfig.h5Service}/channel?id=${cid}`;
      return fetch(url, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
    },

    selectChannel(sid, data) {
      const url = `${appConfig.h5Service}/channel/${sid}/select`;
      return fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });
    },

    unselectChannel(sid, data) {
      const url = `${appConfig.h5Service}/channel/${sid}/select`;
      return fetch(url, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });
    },

    modChannelParam(sid, data) {
      const url = `${appConfig.h5Service}/channel/${sid}/select`;
      return fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });
    },

    packageQrc(sid) {
      const url = `${appConfig.h5Service}/channel/${sid}/exportqrc`;
      window.open(url)
    },

    downloadExcel(sid) {
      const url = `${appConfig.h5Service}/channel/${sid}/exportexcel`;
      window.open(url)
    },

    uploadChannelParamsExcel(data) {
      const url = `${appConfig.h5Service}/channel/uploader`;
      return fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });
    }

  };
};

export default genReq;
