<template>
  <div class="container-card">
    <div class="wrap">
      <div class="main">
        <h4>{{ info.name }}</h4>
        <div class="mar-t-6">
          <img
            class="icon"
            src="http://10.10.2.87:8086/resources/com/bsoft/adapter/manager/AdapterMaint/css/icon-weizhi.png"
            alt=""
          />
          <span>{{ info.serviceName }}</span>
        </div>
        <div class="mar-t-6">
          <span>集群数量:</span><span>{{ info.clusterNumber }}</span>
        </div>
        <p class="mar-t-6">当天： {{ info.daySuccessTime }} / {{ info.dayFailTime }}</p>
        <p class="mar-t-6">设备: {{ info.linkerNumber }}</p>
        <img class="img-pos" src="http://10.10.2.87:8086/resources/com/bsoft/adapter/manager/AdapterMaint/css/icon-nor.png" />
      </div>
      <div class="footer">
        <div class="card-btn">
          <div class="btn-line">
            <p class="btn-one">
              <i class="el-icon-tickets" style="color: rgb(94, 123, 228)"></i>
              <span class="btn-text">协议</span>
            </p>
            <p class="btn-one">
              <i class="el-icon-view" style="color: rgb(94, 123, 228)"></i>
              <span class="btn-text" @click="getInfo(info)">查看</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: 
    {
      info: {
        type: Object,
        default: () => {
          return {};
        },
      },
      getInfo: {
        type: Function,
        default: () => {
          return ()=>{}
        },
      }
    },
  data() {
    return {};
  },
};
</script>

<style>
.container-card {
  width: 25%;
  box-sizing: border-box;
}
.container-card .wrap {
  background: #fafafa;
  margin-right: 8px;
  margin-bottom: 8px;
}
.container-card .main {
  padding: 16px;
  position: relative;
}
.container-card .icon {
  width: 14px;
  height: 17px;
}
.footer {
  border-top: 1px solid #ccc;
}
.card-btn {
    padding: 16px;
    font-size: 14px;
    color: #666;
    display: flex;
    justify-content: flex-end;
}
.btn-line {
    display: flex;
    flex-direction: row;
    align-items: center;
}
.mar-t-6 {
  margin-top: 6px;
}
.img-pos {
  position: absolute;
  width: 60px;
  min-width: 60px;
  height: 60px;
  right: 0;
  top: 50%;
}
.btn-one {
  cursor: pointer;
}
</style>
