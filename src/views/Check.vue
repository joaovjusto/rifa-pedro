<template>
  <div>
    <div class="top-background" />
    <div class="margin-20">
      <div class="text-center w-100">
        <label class="label-style" for="" style="color: white"
          >Selecione o número desejado, caso queira mais de um terá a opção
          acessando um deles</label
        >
      </div>
      <div class="d-flex pt-5 flex-wrap body">
        <div v-for="(item, i) in returnNumbers" :key="i" class="p-2">
          <div
            :class="`card-number ${item.reserved ? 'reserved' : ''}`"
            @click="openDialog(i + 1, item)"
          >
            <span>{{ item.number }}</span>
            <small class="d-block ml-2" v-if="item.reserved">{{
              item.user.split(" ")[0]
            }}</small>
          </div>
        </div>
      </div>
    </div>
    <el-dialog
      :title="`Reservar número ${openedNumer}`"
      :visible.sync="dialogVisible"
      :width="returnModalWidth"
    >
      <div class="form-row">
        <div class="col-12">
          <label for="">Nome Completo</label>
          <el-input disabled placeholder="Insira seu nome" v-model="form.user">
          </el-input>
        </div>
        <div class="col-12 mt-3">
          <label for="">Telefone</label>
          <el-input
            disabled
            v-mask="['(##) ####-####', '(##) #####-####']"
            placeholder="Insira seu telefone"
            v-model="form.celular"
          >
          </el-input>
        </div>
        <div class="col-12 mt-3">
          <label for="">E-mail</label>
          <el-input
            disabled
            placeholder="Insira seu E-mail"
            v-model="form.email"
          >
          </el-input>
        </div>
        <div class="col-12 mt-3">
          <label for="">Números </label>
          <el-select
            class="w-100"
            v-model="form.numbers"
            multiple
            disabled
            placeholder="Selecione"
          >
            <el-option
              v-for="(item, i) in returnNumbers"
              :key="i"
              v-if="!item.reserved"
              :label="item.number"
              :value="item.number"
            >
            </el-option>
          </el-select>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { numbersCollection, FirebaseStorage } from "../common/firebase";

export default {
  name: "principal",
  data() {
    return {
      loadingUpload: false,
      reservedNumbers: [],
      uploaded: false,
      fileList: [],
      dialogVisible: false,
      form: {
        user: "",
        celular: "",
        email: "",
        numbers: [],
        url: "",
        status: "reserved"
      },
      openedNumer: "",
      unsubscribe: ""
    };
  },
  mounted() {
    this.unsubscribe = numbersCollection.onSnapshot(querySnapshot => {
      querySnapshot.docChanges().forEach(change => {
        const data = change.doc.data();

        data.numbers.map(number => {
          if (
            !this.reservedNumbers.find(currNumber => currNumber === number) &&
            data.status !== "deleted"
          ) {
            this.reservedNumbers.push({
              number,
              user: data.user,
              userObj: data
            });
          }
        });
      });
    });
    this.loadingTimer();
  },
  computed: {
    returnModalWidth() {
      if (document.body.clientWidth > 600) {
        return "40%";
      } else {
        return "80%";
      }
    },
    returnNumbers() {
      // return reservedNumbers
      let arrNumbers = [];
      let i;
      for (i = 1; i <= 150; i++) {
        const numberTEMP = this.reservedNumbers.find(
          number => number.number === i
        );
        if (numberTEMP) {
          arrNumbers.push({
            number: i,
            user: numberTEMP.user,
            userObj: numberTEMP.userObj,
            reserved: true
          });
        } else {
          arrNumbers.push({
            number: i,
            user: "",
            userObj: {},
            reserved: false
          });
        }
      }
      return arrNumbers;
    },
    returnDisabled() {
      if (
        this.form.user != "" &&
        this.form.celular != "" &&
        this.form.email != "" &&
        this.form.numbers != [] &&
        this.uploaded
      ) {
        return false;
      }
      return true;
    }
  },
  methods: {
    finishPayment() {
      numbersCollection
        .doc()
        .set(this.form)
        .then(() => {
          console.log("Document successfully written!");
          this.dialogVisible = false;
          this.uploaded = false;
          this.form = {
            user: "",
            celular: "",
            email: "",
            numbers: [],
            url: "",
            status: "reserved"
          };
          this.fileList = [];
          this.$message({
            message: "Obrigado pela contribuição e boa sorte!!",
            type: "success"
          });
        })
        .catch(error => {
          console.error("Error writing document: ", error);
        });
    },
    openDialog(i, user) {
      this.form = user.userObj;

      this.form.numbers = [i];
      this.openedNumer = i;
      this.dialogVisible = true;
    },
    async fileInput(file) {
      try {
        if (file && file.name) {
          this.processing = true;

          var url = file.url;

          const imgData = new FormData();
          imgData.append("image", file);
          const filePath = `comprovantes/${Date.now()}-${file.name}`;
          const metadata = { contentType: file.type };
          const that = this;

          that.loadingUpload = true;

          // await FirebaseStorage.ref().child(filePath);
          fetch(url)
            .then(res => res.blob())
            .then(blob =>
              FirebaseStorage.ref()
                .child(filePath)
                .put(blob, metadata)
                .then(function(snapshot) {
                  console.log(snapshot);
                  console.log("Uploaded a blob!");

                  console.log("filePath: ", filePath);

                  that.uploaded = true;
                  that.loadingUpload = false;

                  FirebaseStorage.ref()
                    .child(filePath)
                    .getDownloadURL()
                    .then(function(url) {
                      console.log(url);
                      that.form.url = url;
                    })
                    .catch(function(error) {
                      console.log(error);
                    });
                })
            );
        }
      } catch (e) {
        console.error(e);
      } finally {
        this.processing = false;
      }
    },
    loadingTimer() {
      var self = this;
      this.$store.commit("SET_LOADING_STATUS", true);

      setTimeout(function() {
        self.$store.commit("SET_LOADING_STATUS", false);
        self.show = true;
      }, 2000);
    }
  }
};
</script>

<style lang="scss">
@import url("https://fonts.googleapis.com/css?family=Open+Sans");
.v-modal {
  display: none;
}
.el-dialog__wrapper {
  background-color: rgba(0, 0, 0, 0.3);
}
img {
  user-select: none;
  -moz-user-select: none;
  -webkit-user-drag: none;
  -webkit-user-select: none;
  -ms-user-select: none;
}
.top-background {
  position: relative;
  background: url("../assets/top_background.png") no-repeat center;
  min-height: 180px;
  background-size: cover;
  z-index: 2;
}
.body {
  justify-content: center;
  margin-top: -50px;
  padding-bottom: 30px;
  padding-left: 50px;
  padding-right: 50px;
  z-index: 1;
  background: rgb(62, 138, 244);
  background: -moz-linear-gradient(
    180deg,
    rgba(62, 138, 244, 1) 0%,
    rgba(41, 92, 163, 1) 70%,
    rgba(31, 69, 122, 1) 100%
  );
  background: -webkit-linear-gradient(
    180deg,
    rgba(62, 138, 244, 1) 0%,
    rgba(41, 92, 163, 1) 70%,
    rgba(31, 69, 122, 1) 100%
  );
  background: linear-gradient(
    180deg,
    rgba(62, 138, 244, 1) 0%,
    rgba(41, 92, 163, 1) 70%,
    rgba(31, 69, 122, 1) 100%
  );
  filter: progid:DXImageTransform.Microsoft.gradient(startColorstr="#3e8af4",endColorstr="#1f457a",GradientType=1);
}
.card-number {
  cursor: pointer;
  color: #fff;
  background-color: rgba(32, 73, 130, 0.33);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 10px;
  padding: 0 15px 15px 0;
  height: 80px;
  width: 80px;
  span {
    margin: 20px 0 0 5px;
  }
  &.reserved {
    background-color: rgba(255, 73, 130, 0.8);
    pointer-events: all;
  }
}

.margin-20 {
  margin-top: -20px;
}

@media only screen and (max-width: 640px) {
  .margin-20 {
    position: absolute;
    z-index: 2;
    margin-top: -34px;
    padding-top: 10px;
  }
  .top-background {
    background: url("../assets/top_background.png") no-repeat contain;
    min-height: 85px;
    background-size: cover;
  }
  .body {
    padding: 0 10px 30px 10px;
  }
}
@media only screen and (min-width: 1600px) {
  .margin-20 {
    margin-top: 15px;
  }
  // .top-background {
  //   background: url("../assets/top_background.png") no-repeat contain;
  //   min-height: 130px;
  //   background-size: cover;
  // }
}
</style>
