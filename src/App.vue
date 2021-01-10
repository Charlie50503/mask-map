<template>
  <div id="app">
    <div class="row no-gutters">
      <div class="col-sm-3">
        <div class="toolbox">
          <div class="sticky-top bg-white shadow-sm p-2">
            <div class="form-group d-flex">
              <label for="cityName" class="mr-2 col-form-label text-right">縣市</label>
              <div class="flex-fill">
                <select
                  name
                  id="cityName"
                  class="form-control"
                  v-model="select.city"
                  @change="select.area = ''"
                >
                  <option value="null">--Select One--</option>
                  <option
                    :value="c.CityName"
                    v-for="c in cityName"
                    :key="c.CityName"
                  >{{ c.CityName }}</option>
                </select>
              </div>
            </div>
            <div class="form-group d-flex">
              <label for="area" class="mr-2 col-form-label text-right">地區</label>
              <div class="flex-fill">
                <select
                  id="area"
                  class="form-control"
                  v-if="select.city.length"
                  v-model="select.area"
                  @change="updateSelect"
                >
                  <option value>-- Select One --</option>
                  <option
                    :value="a.AreaName"
                    v-for="a in this.cityName.filter(
          city => city.CityName === select.city
        )[0].AreaList"
                    :key="a.AreaName"
                  >{{ a.AreaName }}</option>
                </select>
              </div>
            </div>
            <p class="mb-0 small text-muted text-right">請先選擇區域查看（綠色表示還有口罩）</p>
          </div>
          <ul class="list-group">
            <template v-for="(item, key) in data">
              <a
                class="list-group-item text-left"
                :key="key"
                v-if="
                  item.properties.address.match(select.city) &&
                    item.properties.address.match(select.area)
                "
                :class="{ highlight: item.properties.mask_adult || item.properties.mask_child }"
                @click="penTo(item)"
              >
                <h3>{{ item.properties.name }}</h3>
                <p class="mb-0">
                  成人口罩：{{ item.properties.mask_adult }} | 兒童口罩：{{
                  item.properties.mask_child
                  }}
                </p>
                <p class="mb-0">
                  地址：
                  <a
                    :href="`https://www.google.com.tw/maps/place/${item.properties.address}`"
                    target="_blank"
                    title="Google Map"
                  >{{ item.properties.address }}</a>
                </p>
              </a>
            </template>
          </ul>
        </div>
      </div>
      <div class="col-sm-9">
        <div id="map"></div>
      </div>
    </div>
  </div>
</template>
<script>
// @ is an alias to /src
import L from "leaflet";
import cityName from "./cityName.json";
let osmMap = {};
const iconsConfig = {
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popuAnchor: [1, -34],
  shadowSize: [41, 41]
};
const icons = {
  green: new L.Icon({
    iconUrl:
      "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
    ...iconsConfig
  }),
  grey: new L.Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png",
    ...iconsConfig
  })
};

const osm = {
  addMapMarker(x, y, item) {
    const icon = item.mask_adult || item.mask_child ? icons.green : icons.grey;
    L.marker([y, x], { icon }).addTo(osmMap).bindPopup(`<strong>${
      item.name
    }</strong><br>
  口罩剩餘:<strong>成人 - ${
    item.mask_adult ? `${item.mask_adult} 個` : `未取得資料`
  }/兒童 - ${
      item.mask_child ? `${item.mask_child} 個` : `未取得資料`
    }</strong><br>
  地址:<a href="https://www.google.co.jp/maps/place/${item.address}">${
      item.address
    }</a><br>
  電話:<strong>${item.phone}</strong><br>
  <small>最後更新時間:${item.updated}</small>`);
  },
  removeMarker() {
    osmMap.eachLayer(layer => {
      if (layer instanceof L.Marker) {
        osmMap.removeLayer(layer);
      }
    });
  },
  penTo(x, y, item) {
    const icon = item.mask_adult || item.mask_child ? icons.green : icons.grey;
    osmMap.panTo(new L.LatLng(y, x));
    L.marker([y, x], { icon })
      .addTo(osmMap)
      .bindPopup(
        `<strong>${item.name}</strong><br>
  口罩剩餘:<strong>成人 - ${
    item.mask_adult ? `${item.mask_adult} 個` : `未取得資料`
  }/兒童 - ${
          item.mask_child ? `${item.mask_child} 個` : `未取得資料`
        }</strong><br>
  地址:<a href="https://www.google.co.jp/maps/place/${item.address}">${
          item.address
        }</a><br>
  電話:<strong>${item.phone}</strong><br>
  <small>最後更新時間:${item.updated}</small>`
      )
      .openPopup();
  }
};

export default {
  data: () => ({
    data: {},
    cityName,
    select: {
      city: "臺北市",
      area: "大安區"
    },
    arealist: []
    // pharmacies: []
  }),
  computed: {
    pharmacies() {
      if (this.data.properties) {
        return this.updateMarker();
      } else {
        return [];
      }
    }
  },
  components: {},
  methods: {
    filterArea() {
      console.log(this.cityName, this.cityName[0].CityName);
      if (this.cityName && this.cityName[0].CityName) {
        let list = this.cityName
          .filter(city => city.CityName === this.select.city)[0]
          .AreaList.filter(area => area.AreaName === this.select.area);
        console.log("list,", list);
        // let arealist1 = list[0].AreaList.filter(
        //   area => area.AreaName === this.select.area
        // );
        this.arealist = list;
        // console.log(arealist)
      }
    },
    updateMarker() {
      const stores = this.data.filter(store => {
        if (!this.select.area) {
          return store.properties.address.match(this.select.city);
        }
        return store.properties.address.match(this.select.area);
      });
      stores.forEach(store => {
        const { properties, geometry } = store;
        osm.addMapMarker(
          geometry.coordinates[0],
          geometry.coordinates[1],
          properties
        );
      });
    },
    removeMarker() {
      osm.removeMarker();
    },
    penTo(store) {
      const { properties, geometry } = store;
      osm.penTo(geometry.coordinates[0], geometry.coordinates[1], properties);
    },
    updateSelect() {
      this.removeMarker();
      this.updateMarker();
      const store = this.data.find(item =>
        item.properties.address.match(this.select.area)
      );
      const { geometry, properties } = store;
      osm.penTo(geometry.coordinates[0], geometry.coordinates[1], properties);
    }
  },
  mounted() {
    // const url = "https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json";
    // this.$http.get(url).then(response => {
    //   console.log(response.data);
    //   this.data = response.data.features;
    // });
    osmMap = L.map("map", {
      center: [25.03, 121.55],
      zoom: 15
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
      maxZoom: 18
    }).addTo(osmMap);

    Promise.all([
      this.$http.get(
        "https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json"
      )
      // this.$http.get("cityName.json")
    ]).then(([res]) => {
      this.data = res.data.features;
      // this.cityName = cityNameRes.data;
      this.updateMarker();
      // this.filterArea();
    });
  },
  beforeUpdate() {
    this.filterArea();
  }
};
</script>
<style lang="scss">
#map {
  height: 100vh;
}
.highlight {
  background: #e9ffe3;
}
.toolbox {
  height: 100vh;
  overflow-y: auto;
  a {
    cursor: pointer;
  }
}
</style>
