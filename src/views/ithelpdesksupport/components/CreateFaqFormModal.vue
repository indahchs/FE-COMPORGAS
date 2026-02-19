<template>
  <v-row justify="center">
    <v-dialog v-model="isOpen" width="1000" persistent>
      <v-card>
        <v-card-title>
          <v-row align="center">
            <v-col>
              <div style="font-size: 18px; line-height: 28px; font-weight: 600; color: #000000;">
                {{ title }}
              </div>
            </v-col>
            <v-col class="text-right">
              <v-btn style="color: #606060" icon dark @click="close">
                <v-icon>{{ icons.mdiClose }}</v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="6">
              <label class="required">Catalog</label>
              <v-select
                :items="dataCatalog"
                v-model.trim="$v.catalogId.$model"
                :error-messages="getErrors('catalogId', $v.catalogId)"
                @blur="$v.catalogId.$touch()"
                outlined
                item-text="label"
                item-value="value"
                placeholder="Catalog"
              ></v-select>
            </v-col>
            <v-col cols="6"></v-col>
            <v-col cols="6">
              <label class="required">Question</label>
              <quill-editor
                v-model.trim="$v.question.$model"
                :error-messages="getErrors('question', $v.question)"
                @blur="$v.question.$touch()"
                ref="questionEditor"
                :options="editorOption"
                @focus="onEditorFocus($event)"
                @ready="onEditorReady($event)"
              ></quill-editor>
            </v-col>
            <v-col cols="6">
              <label class="required">Answer</label>
              <quill-editor
                v-model.trim="$v.answer.$model"
                :error-messages="getErrors('answer', $v.answer)"
                @blur="$v.answer.$touch()"
                ref="answerEditor"
                :options="editorOption"
                @focus="onEditorFocus($event)"
                @ready="onEditorReady($event)"
              ></quill-editor>
            </v-col>
            <v-col cols="6">
              <label>Upload Attachment</label>
              <v-row style="margin: 0px" class="mb-5">
                <v-col
                  v-if="selectedFile1 === null"
                  style="text-align: center; border-style: dotted"
                  cols="12"
                  @click="onButtonClick"
                >
                  <v-icon size="50">{{ icons.mdiFileDocumentOutline }}</v-icon><br />
                  <span class="font-subt">Add File</span><br />
                  <span class="font-subt">Max 1 file and max size 5 MB</span>
                </v-col>
                <v-col v-else class="mb-12" style="text-align: center" cols="12">
                  <button style="float: right" id="x" @click="deleteImage()">X</button>
                  <v-icon size="50">{{ icons.mdiFileDocumentOutline }}</v-icon>
                  <br /><span class="limit-text">{{ inputText }}</span>
                </v-col>
                <input ref="uploader" class="d-none" type="file"
                  accept="image/*, .pdf, .xls, .xlsx" @change="onFileChanged" />
              </v-row>
            </v-col>
          </v-row>
          <br />
          <v-btn class="btn-submit" @click="submit" :loading="loading">Submit</v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
import { required } from "vuelidate/lib/validators";
import { mdiClose, mdiFileDocumentOutline } from "@mdi/js";
import Swal from "sweetalert2";
import FaqService from "../../../services/faq/faqServices";
import CatalogService from "../../../services/catalog/catalogServices";
import { hitAPI } from "@/services/upload/uploadServices";

const faqService = FaqService.build();
const catalogService = CatalogService.build();

export default {
  data() {
    return {
      title: "Create FAQ",
      dataCatalog: [],
      loading: false,
      id: "",
      catalogId: null,
      question: "",
      answer: "",
      imgUpload: null,
      selectedFile1: null,
      inputText: "",
      isDeleted: false,
      icons: { mdiFileDocumentOutline, mdiClose },
      editorOption: { placeholder: "" },
    };
  },
  validations: {
    catalogId: { required },
    question: { required },
    answer: { required },
  },
  props: {
    open: Boolean,
    item: Object,
    domain: String,
  },
  created() {
    this.getCatalog();
  },
  computed: {
    isOpen: {
      get() {
        this.edit();
        return this.open;
      },
      set(value) {
        if (!value) {
          this.clearForm();
          this.$emit("close");
        }
      },
    },
  },
  methods: {
    getErrors(name, model) {
      const errors = [];
      if (!model.$dirty) return errors;
      switch (name) {
        case "catalogId": !model.required && errors.push("Catalog is required."); break;
        case "question":  !model.required && errors.push("Question is required"); break;
        case "answer":    !model.required && errors.push("Answer is required"); break;
      }
      return errors;
    },
    edit() {
      if (this.item != null) {
        this.title = "Edit FAQ";
        this.id = this.item.id;
        this.question = this.item.question;
        this.answer = this.item.answer;
        this.selectedFile1 = this.item.fileUrl || null;
        this.imgUpload = this.item.fileUrl || null;
        this.inputText = this.item.document ? this.item.document.fileName : "";
        this.catalogId = this.item.catalogId || null;
      } else {
        this.title = "Create FAQ";
        this.clearForm();
      }
    },
    async getCatalog() {
      const res = await catalogService.getAllOptions();
      this.dataCatalog = res.data.data;
    },
    async submit() {
      this.$v.$touch();
      if (this.$v.$invalid) return;

      this.loading = true;
      const param = {
        id: this.id,
        catalogId: this.catalogId,
        question: this.question,
        answer: this.answer,
        domain: this.domain,
        position: 1,
      };

      const res = this.item == null
        ? await faqService.add(param)
        : await faqService.update(param);

      const resData = res.data;
      if (resData.status === 200) {
        const savedId = resData.data.id;
        if (this.selectedFile1 instanceof File) {
          await this.uploadFile(savedId);
        } else if (this.isDeleted) {
          await hitAPI.delete(`faq/document/${savedId}`);
        }
        this.loading = false;
        Swal.fire({
          icon: "success", title: "Success", text: resData.message,
          showConfirmButton: true, allowEscapeKey: false, allowOutsideClick: false,
        }).then(() => {
          this.$emit("close"); // parent closeModal akan reload data
        });
      } else {
        this.loading = false;
        Swal.fire({ icon: "error", title: "Failed", text: resData.message, showConfirmButton: true });
      }
    },
    async uploadFile(id) {
      const par = new FormData();
      par.append("file", this.selectedFile1);
      const api = this.item != null && !this.isDeleted ? "post" : "post";
      return hitAPI.post(`faq/document/${id}`, par);
    },
    deleteImage() {
      this.$refs.uploader.value = "";
      this.isDeleted = true;
      this.inputText = "";
      this.imgUpload = null;
      this.selectedFile1 = null;
    },
    onFileChanged(e) {
      this.isDeleted = false;
      const file = e.target.files[0];
      if (!file) return;
      this.inputText = file.name;
      if (file.size > 5000000) return this.errorPopup("File upload exceeds the 5MB limit!");
      const allowed = ["image/png","image/jpeg","image/jpg","application/pdf",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];
      if (allowed.includes(file.type)) {
        this.imgUpload = URL.createObjectURL(file);
        this.selectedFile1 = file;
      } else {
        this.errorPopup("Unsupported File Type");
      }
    },
    onButtonClick() {
      window.addEventListener("focus", () => {}, { once: true });
      this.$refs.uploader.click();
    },
    onEditorFocus() {},
    onEditorReady() {},
    errorPopup(val) {
      Swal.fire({ title: "Failed", text: val, icon: "error", timer: 2000 });
    },
    close() {
      this.clearForm();
      this.$emit("close");
    },
    clearForm() {
      this.id = "";
      this.catalogId = null;
      this.selectedFile1 = null;
      this.question = "";
      this.answer = "";
      this.isDeleted = false;
      this.inputText = "";
      this.$v.$reset();
    },
  },
};
</script>

<style scoped>
.btn-submit {
  color: white !important;
  background-color: #0172b9 !important;
  width: 100%;
}
.required:after { content: " *"; color: red; }
#x {
  background: rgb(197, 194, 194);
  color: white;
  width: 25px;
  height: 25px;
  border-radius: 15px;
}
</style>