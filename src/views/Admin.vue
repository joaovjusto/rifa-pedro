<template>
  <div>
    <div class="top-background" />
    <div class="margin-20">
      <div class="d-flex pt-5 flex-wrap body hg-100">
        <div class="d-block image-container" id="carousel">
          <carousel
            :navigationEnabled="true"
            :perPage="1"
            :touchDrag="false"
            :mouseDrag="false"
          >
            <slide
              v-for="(item, index) in comprovantes"
              :key="index"
              v-if="item.status === 'reserved'"
            >
              <div class="width:100%">
                <img v-if="canRenderCarousel" :src="item.url" alt="" />
                <div class="text-center">
                  <small for="">Comprador:</small>
                  <small>
                    {{ item.user }}
                  </small>
                  <el-divider direction="vertical"></el-divider>
                  <small for="">Números comprados:</small>
                  <small>
                    {{ item.numbers.length }}
                  </small>
                  <div class="d-block mt-2">
                    <el-button
                      type="danger"
                      icon="el-icon-delete"
                      @click="previousPage(item)"
                      circle
                    ></el-button>
                    <el-button
                      type="success"
                      icon="el-icon-check"
                      @click="nextPage(item)"
                      circle
                    ></el-button>
                  </div>
                </div>
              </div>
            </slide>
          </carousel>
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
          <el-input placeholder="Insira seu nome" v-model="form.user">
          </el-input>
        </div>
        <div class="col-12 mt-3">
          <label for="">Telefone</label>
          <el-input
            v-mask="['(##) ####-####', '(##) #####-####']"
            placeholder="Insira seu telefone"
            v-model="form.celular"
          >
          </el-input>
        </div>
        <div class="col-12 mt-3">
          <label for="">E-mail</label>
          <el-input placeholder="Insira seu E-mail" v-model="form.email">
          </el-input>
        </div>
        <div class="col-12 mt-3">
          <label for=""
            >Números Adicionais
            <small class="d-block"
              >(opcional deixe vazio caso seja apenas um)</small
            >
          </label>
          <el-select
            class="w-100"
            v-model="form.numbers"
            multiple
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
        <div class="col-12 mt-3">
          <label for="">Upload do comprovante (R$ 20,00 por número)</label>
          <el-upload
            class="upload-demo"
            action=""
            :on-change="fileInput"
            :file-list="fileList"
            v-loading="loadingUpload"
            :auto-upload="false"
            list-type="picture"
          >
            <el-button size="small" type="primary"
              >Clique para fazer o upload</el-button
            >
            <div slot="tip" class="el-upload__tip">
              aceito arquivos jpg/png
            </div>
          </el-upload>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">Cancelar</el-button>
        <el-button
          :disabled="returnDisabled"
          type="primary"
          @click="finishPayment()"
          >Confirmar</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { numbersCollection, FirebaseStorage } from "../common/firebase";

export default {
  name: "principal",
  data() {
    return {
      canRenderCarousel: false,
      updateCarousel: 0,
      comprovantes: [],
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
        const id = change.doc.id;
        const that = this;
        data.id = id;
        this.updateCarousel += 1;
        setTimeout(function() {
          that.canRenderCarousel = true;
          let el = document.getElementsByClassName("VueCarousel-dot");
          el[0].click();
        }, 2000);
        this.comprovantes.push(data);

        data.numbers.map(number => {
          if (!this.reservedNumbers.find(currNumber => currNumber === number)) {
            this.reservedNumbers.push({ number, user: data.user });
          }
        });
      });
    });
    this.loadingTimer();
  },
  computed: {
    returnModalWidth() {
      console.log(document.body.clientWidth);
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
            reserved: true
          });
        } else {
          arrNumbers.push({
            number: i,
            user: "",
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
    nextPage(item) {
      this.unsubscribe();
      const tempObj = Object.assign({}, item);
      tempObj.status = "confirmed";
      numbersCollection
        .doc(tempObj.id)
        .update(tempObj)
        .then(() => {
          let el = document.getElementsByClassName(
            "VueCarousel-navigation-next"
          );
          el[0].click();

          this.$message({
            message: "Número confirmado com sucesso!!",
            type: "success"
          });
        });
    },
    previousPage(item) {
      this.unsubscribe();
      const tempObj = Object.assign({}, item);
      tempObj.status = "deleted";
      numbersCollection
        .doc(tempObj.id)
        .delete()
        .then(() => {
          let el = document.getElementsByClassName(
            "VueCarousel-navigation-next"
          );
          el[0].click();

          this.$message({
            message: "Número deletado com sucesso!!",
            type: "success"
          });
        });
    },
    finishPayment() {
      console.log(this.form);
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
    openDialog(i) {
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

.VueCarousel-navigation {
  position: absolute;
  top: -100000px;
}
#container {
  padding: 0 60px;
}

.VueCarousel-dot-container {
  pointer-events: none;
}

.image-container {
  max-width: 100%;
}

.VueCarousel-slide {
  position: relative;
  background: transparent;
  color: #fff;
  font-family: Arial;
  font-size: 24px;
  text-align: center;
  min-height: 100px;
  img {
    max-height: 500px;
  }
}

.label {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.v-modal {
  display: none;
}
.hg-100 {
  height: 100vh;
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
    pointer-events: none;
  }
}

.margin-20 {
  margin-top: -20px;
}

@media only screen and (max-width: 640px) {
  .margin-20 {
    position: absolute;
    z-index: 2;
    margin-top: 22px;
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
  .VueCarousel-slide {
    img {
      max-height: 500px;
    }
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
