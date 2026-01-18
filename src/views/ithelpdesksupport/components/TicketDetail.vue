<template>
  <div>
    <v-card class="pa-4">
      <v-row>
        <v-col cols="8">
          <v-row align="center" justify="center">
            <v-col class="container-left">
              <v-btn icon class="rounded-circle" @click="goBack" depressed>
                <v-icon size="45" color="black">
                  {{ icons.mdiChevronLeft }}
                </v-icon>
              </v-btn>
              <img @click="goBack" class="ml-2 icon-apps" src="../../../assets/images/icons/laptop.png" />
              <div @click="goBack" class="mt-2 ml-2" style="cursor: pointer">
                <span style="font-size: 14px">{{ dataClick.catalogName }}</span>
                <p style="font-size: 12px">{{ dataClick.number }}</p>
              </div>
            </v-col>
            <v-col class="container-right">
              <span style="font-weight: bold; color: #101010">
                {{ dataClick.title }}
              </span>
              <div>
                <span class="px-2" style="color: white; background-color: #0172b9; border-radius: 5px;"
                  v-if="dataClick.statusId === 'SUBMITTED'">
                  {{ dataClick.statusName }}
                  <v-icon color="white">{{ icons.mdiCheck }}</v-icon>
                </span>
                <span class="px-2" style="color: white; background-color: #0172b9; border-radius: 5px;"
                  v-if="dataClick.statusId === 'INPROGRESS'">
                  {{ dataClick.statusName }}
                  <v-icon color="white">{{ icons.mdiCheck }}</v-icon>
                </span>
                <span class="px-2" style="color: white; background-color: #ff7a00; border-radius: 5px;"
                  v-if="dataClick.statusId === 'PENDING'">
                  {{ dataClick.statusName }}
                  <v-icon color="white">{{ icons.mdiCheck }}</v-icon>
                </span>
                <span class="px-2" style="color: white; background-color: #a11497; border-radius: 5px;"
                  v-if="dataClick.statusId === 'ASSIGNED'">
                  {{ dataClick.statusName }}
                  <v-icon color="white">{{ icons.mdiCheck }}</v-icon>
                </span>
                <span class="px-2" style="color: white; background-color: #ec323f; border-radius: 5px;"
                  v-if="dataClick.statusId === 'LATE'">
                  {{ dataClick.statusName }}
                  <v-icon color="white">{{ icons.mdiCheck }}</v-icon>
                </span>
                <span class="px-2" style="color: white; background-color: #adc43b; border-radius: 5px;"
                  v-if="dataClick.statusId === 'RESOLVED'">
                  {{ dataClick.statusName }}
                  <v-icon color="white">{{ icons.mdiCheckAll }}</v-icon>
                </span>
              </div>
            </v-col>
          </v-row>
          <v-row class="mt-4">
            <v-col cols="12">
              <v-card class="ml-2" tile outlined>
                <div ref="chatbox" style="height: 400px; overflow-y: scroll">
                  <div v-for="(item, id) in dataChat" :key="id">
                    <v-card-text class="pa-4" :class="item.userId == dataClick.picId ? 'text-right' : ''">
                      <v-row class="pa-2">
                        <v-col>
                          <div class="chat-user-name-label">{{ item.userName }}</div>
                          <div class="chat-timestamp-label">{{ formatDateTime(item.createdAt) }}</div>
                        </v-col>
                      </v-row>
                      <v-divider />
                      <v-row class="pa-2">
                        <v-col>
                          <p class="chat-content-text">{{ item.content }}</p>
                          <img
                            v-if="item.document != null && (item.document.fileType == 'image/jpeg' || item.document.fileType == 'image/jpg' || item.document.fileType == 'image/png')"
                            style="height: 100px; cursor: pointer" :src="baseUrl + item.fileUrl"
                            @click="showImage(item.fileUrl)" />
                          <v-btn outlined depressed small
                            v-if="item.document != null && item.document.fileType == 'application/pdf'"
                            @click="downloadDoc(item)">
                            <v-icon>{{ icons.mdiFilePdfBox }}</v-icon>
                            Download File
                          </v-btn>
                          <v-btn outlined depressed small
                            v-if="item.document != null && (item.document.fileType == 'application/zip' || item.document.fileType == 'application/rar')"
                            @click="downloadDoc(item)">
                            <v-icon>{{ icons.mdiFolderZip }}</v-icon>
                            Download File
                          </v-btn>
                          <v-btn outlined depressed small
                            v-if="(item.document != null && item.document.fileType == 'application/msword') || (item.document != null && item.document.fileType == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')"
                            @click="downloadDoc(item)">
                            <v-icon>{{ icons.mdiFileWordBox }}</v-icon>
                            Download File
                          </v-btn>
                          <v-btn outlined depressed small
                            v-if="(item.document != null && item.document.fileType == 'application/vnd.ms-excel') || (item.document != null && item.document.fileType == 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')"
                            @click="downloadDoc(item)">
                            <v-icon>{{ icons.mdiFileExcelBox }}</v-icon>
                            Download File
                          </v-btn>
                          <v-btn outlined depressed small
                            v-if="(item.document != null && item.document.fileType == 'application/vnd.ms-powerpoint') || (item.document != null && item.document.fileType == 'application/vnd.openxmlformats-officedocument.presentationml.presentation')"
                            @click="downloadDoc(item)">
                            <v-icon>{{ icons.mdiFilePowerpointBox }}</v-icon>
                            Download File
                          </v-btn>
                        </v-col>
                      </v-row>
                    </v-card-text>
                    <v-divider />
                  </div>
                </div>
                <v-divider />

                <v-card-text v-if="dataClick.statusId !== 'RESOLVED'" style="text-align: center">
                  <v-icon style="float: right" v-if="imgUpload !== null" @click="deleteImage()">
                    {{ icons.mdiDelete }}
                  </v-icon>
                  <img
                    v-if="selectedFile1 != null && (selectedFile1.type === 'image/png' || selectedFile1.type === 'image/jpeg' || selectedFile1.type === 'image/jpg')"
                    style="width: 20%" :src="imgUpload" />
                  <div
                    v-if="selectedFile1 != null && (selectedFile1.type !== 'image/png' && selectedFile1.type !== 'image/jpeg' && selectedFile1.type !== 'image/jpg')"
                    class="py-4">
                    {{ selectedFile1.name }}
                  </div>
                </v-card-text>
                <v-card-actions v-if="dataClick.statusId !== 'RESOLVED' && !isITLead">
                  <v-text-field v-model="message" label="Type your message" @keydown.enter="sendMessage"></v-text-field>
                  <v-icon @click="onButtonClick" style="cursor: pointer" color="#0172b9">
                    {{ icons.mdiPaperclip }}
                  </v-icon>
                  <v-btn class="mx-4 btn-chat" @click="sendMessage" :disabled="!message.trim()">Send</v-btn>
                  <input ref="uploader" class="d-none" type="file" accept="image/*, .pdf, .zip, .rar"
                    @change="onFileChanged" />
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </v-col>
        <v-col cols="4">
          <v-btn @click="dispatch" v-if="dataClick.statusId !== 'RESOLVED'" class="btn-action mb-6"
            :loading="loading">Dispatch</v-btn>
          <v-btn @click="resolved"
            v-if="dataClick.statusId !== 'RESOLVED' && dataClick.statusId !== 'PENDING' && !isITLead"
            class="btn-action mb-6" :loading="loading">Resolved</v-btn>
          <v-btn @click="resume"
            v-if="dataClick.statusId === 'PENDING' && dataClick.statusId !== 'RESOLVED' && !isITLead"
            class="btn-action mr-4 mb-6" :loading="loading">Resume</v-btn>
          <v-btn @click="pending"
            v-if="dataClick.statusId !== 'PENDING' && dataClick.statusId !== 'RESOLVED' && !isITLead"
            class="btn-pending mr-4 mb-8" :loading="loading">Pending</v-btn>

          <div
            v-if="dataClick.statusId === 'RESOLVED' && dataClick.rating !== '' && dataClick.testimonial !== '' && isITLead">
            <span style="color: #101010">Review</span>
            <star-rating :rating="dataClick.rating" :show-rating="false" :read-only="true" :increment="1"></star-rating>
            <v-textarea outlined disabled auto-grow :value="dataClick.testimonial"></v-textarea>
          </div>

          <span style="color: #101010">Activity log</span>
          <v-timeline dense style="max-height: 1000px; overflow-y: scroll">
            <v-timeline-item dot-color="pink" small v-for="(event, id) in timelineEvents" :key="id">
              <div>
                <strong class="me-4">{{ event.statusName }}</strong><br />
                <div>
                  <strong>{{ formatDate(event.createdAt) }}</strong>
                  <div class="text-caption">{{ event.description }}</div>
                </div>
              </div>
            </v-timeline-item>
          </v-timeline>
          <div class="mt-8" v-if="ticketDispatch !== null">
            <span style="color: #101010">Dispatch Note</span>
            <v-textarea outlined disabled auto-grow :value="ticketDispatch.note"></v-textarea>
          </div>
        </v-col>
      </v-row>
    </v-card>

    <v-dialog v-model="dialog" width="400px" persistent>
      <v-card>
        <v-card-title>
          <v-row align="center">
            <v-col>
              <div style="font-size: 18px; line-height: 28px; font-weight: 600; color: #000000;">
                Dispatch
              </div>
            </v-col>
            <v-col class="text-right">
              <v-btn icon class="rounded-circle" @click="closeModal">
                <v-icon color="black">{{ icons.mdiClose }}</v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </v-card-title>
        <v-card-text>
          <form @submit.prevent="submit">
            <label class="required">Choose Location</label>
            <v-select 
              dense 
              v-model.trim="$v.dispatchLocation.$model"
              :error-messages="getErrors('dispatchLocation', $v.dispatchLocation)" 
              @blur="$v.dispatchLocation.$touch()"
              @change="onLocationChange"
              outlined 
              :items="filteredLocationList" 
              placeholder="Location"
              :no-data-text="'No location available for this catalog'"
            ></v-select>
            <label class="required">Choose PIC</label>
            <v-select 
              dense 
              v-model.trim="$v.dispatchPic.$model"
              :error-messages="getErrors('dispatchPic', $v.dispatchPic)" 
              @blur="$v.dispatchPic.$touch()" 
              outlined
              :items="filteredPicList" 
              :disabled="!dispatchLocation"
              placeholder="PIC"
              :no-data-text="!dispatchLocation ? 'Please select location first' : 'No PIC available for this location'"
            ></v-select>
            <label class="required">Note</label>
            <v-textarea 
              v-model.trim="$v.dispatchNote.$model"
              :error-messages="getErrors('dispatchNote', $v.dispatchNote)" 
              @blur="$v.dispatchNote.$touch()" 
              outlined
              dense 
              placeholder="input note"
            ></v-textarea>
            <v-btn :loading="dispatchLoading" style="width: 100%" @click="saveDispatch" class="btn-action mr-4 mb-6">
              Dispatch Ticket
            </v-btn>
          </form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="imagePreviewDialog" width="600px">
      <v-card>
        <v-card-title>
          <v-row align="center">
            <v-col>
              <div style="font-size: 18px; line-height: 28px; font-weight: 600; color: #000000;">
                Attachment Image
              </div>
            </v-col>
            <v-col class="text-right">
              <v-btn icon class="rounded-circle" @click="closeModal">
                <v-icon color="black">{{ icons.mdiClose }}</v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </v-card-title>
        <v-card-text>
          <img style="width: 100%" :src="imageSrc" />
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import Swal from "sweetalert2";
import moment from "moment";
import { hitAPI } from "@/services/upload/uploadServices";
import { required } from "vuelidate/lib/validators";
import ItHelpDeskService from "@/services/ithelpdesk/itHelpDeskServices";
import StarRating from "vue-star-rating";

const ticketService = ItHelpDeskService.build();

import {
  mdiChevronLeft,
  mdiPaperclip,
  mdiDelete,
  mdiClose,
  mdiFolderZip,
  mdiFilePdfBox,
  mdiFileWordBox,
  mdiFileExcelBox,
  mdiFilePowerpointBox,
  mdiCheck,
  mdiCheckAll,
} from "@mdi/js";

export default {
  name: "TicketDetail",
  components: {
    StarRating,
  },
  data() {
    return {
      icons: {
        mdiClose,
        mdiDelete,
        mdiPaperclip,
        mdiChevronLeft,
        mdiFolderZip,
        mdiFilePdfBox,
        mdiFileWordBox,
        mdiFileExcelBox,
        mdiFilePowerpointBox,
        mdiCheck,
        mdiCheckAll,
      },
      baseUrl: process.env.VUE_APP_PERTAGAS,
      loading: false,
      dispatchLoading: false,
      dispatchLocation: "",
      dispatchPic: "",
      dispatchNote: "",
      dialog: false,
      imgUpload: null,
      selectedFile1: null,
      isSelecting: false,
      message: "",
      ticketDispatch: null,
      dataChat: [],
      timelineEvents: [],
      dataClick: {},
      dataPic: [],
      dataLoc: [],
      catalogPicList: [], // Menyimpan list PIC dari catalog
      imageSrc: "",
      imagePreviewDialog: false,
      isITLead: false,
      timer: null,
    };
  },
  computed: {
    // Filter location berdasarkan PIC yang ada di catalog dan aktif
    filteredLocationList() {
      if (!this.catalogPicList.length) {
        return [];
      }
      
      // Ambil semua location yang punya PIC aktif di catalog ini
      const availableLocations = this.catalogPicList
        .filter(pic => pic.active === true)
        .map(pic => pic.officeLocationId);
      
      // Hilangkan duplikat
      const uniqueLocations = [...new Set(availableLocations)];
      
      // Filter dataLoc berdasarkan location yang tersedia
      return this.dataLoc.filter(loc => uniqueLocations.includes(loc.value));
    },
    
    // Filter PIC berdasarkan location yang dipilih dan yang aktif
    filteredPicList() {
      if (!this.dispatchLocation || !this.catalogPicList.length) {
        return [];
      }
      
      // Filter PIC yang sesuai dengan location dan status active
      const filtered = this.catalogPicList
        .filter(pic => 
          pic.officeLocationId === this.dispatchLocation && 
          pic.active === true
        )
        .map(pic => ({
          value: pic.userId,
          text: pic.userName
        }));
      
      return filtered;
    }
  },
  created() {
    this.getUserData();
    this.getLoc();

    if (this.$route.params.ticket) {
      this.dataClick = this.$route.params.ticket;
      this.getCatalogDetail(this.dataClick.catalogId);
      this.getChat(this.dataClick.id);
      this.getTimeline(this.dataClick.id);
      this.getTicketLatestDispatch(this.dataClick.id);
    } else if (this.$route.params.id) {
      this.fetchTicketData(this.$route.params.id);
    }
  },
  mounted() {
    this.scrollChatbox();
    this.timer = setInterval(() => {
      if (this.dataClick.id) {
        this.getChat(this.dataClick.id);
      }
    }, 2000);
  },
  beforeDestroy() {
    clearInterval(this.timer);
  },
  validations: {
    dispatchLocation: { required },
    dispatchPic: { required },
    dispatchNote: { required },
  },
  methods: {
    // Method baru untuk get detail catalog beserta list PIC nya
    async getCatalogDetail(catalogId) {
      try {
        const res = await ticketService.getHelpDeskById(catalogId);
        if (res.data.status === 200) {
          this.catalogPicList = res.data.data.listPic || [];
        }
      } catch (error) {
        console.error("Failed to get catalog detail:", error);
      }
    },
    
    // Method untuk handle perubahan location
    onLocationChange() {
      // Reset PIC selection ketika location berubah
      this.dispatchPic = "";
      this.$v.dispatchPic.$reset();
    },
    
    async fetchTicketData(ticketId) {
      this.loading = true;
      try {
        const param = {
          keyword: null,
          location: null,
          startDate: null,
          endDate: null,
          catalog: null,
          status: null,
          size: 1000,
          page: 0,
        };
        const res = await ticketService.getTicketPic(param);
        const ticket = res.data.data.content.find(x => x.id === ticketId);

        if (ticket) {
          this.dataClick = ticket;
          this.getCatalogDetail(ticket.catalogId);
          this.getChat(ticket.id);
          this.getTimeline(ticket.id);
          this.getTicketLatestDispatch(ticket.id);
        } else {
          this.errorPopup("Ticket not found");
          this.goBack();
        }
      } catch (error) {
        this.errorPopup("Failed to load ticket");
        this.goBack();
      } finally {
        this.loading = false;
      }
    },
    async saveDispatch() {
      this.$v.$touch();
      if (!this.$v.$invalid) {
        this.dispatchLoading = true;
        const param = {
          ticketId: this.dataClick.id,
          userId: this.dispatchPic,
          note: this.dispatchNote,
        };
        const res = await ticketService.ticketAssign(param);
        this.dispatchLoading = false;

        if (res.data.status === 200) {
          this.closeModal();
          this.successPopup(res.data.message);
          this.dataClick = res.data.data;
          this.getTimeline(res.data.data.id);
        } else {
          this.errorPopup(res.data.message);
        }
      }
    },
    getErrors(name, model) {
      const errors = [];
      if (!model.$dirty) return errors;
      switch (name) {
        case "dispatchLocation":
          !model.required && errors.push("Location is required.");
          break;
        case "dispatchPic":
          !model.required && errors.push("PIC is required");
          break;
        case "dispatchNote":
          !model.required && errors.push("Note is required");
          break;
      }
      return errors;
    },
    scrollChatbox() {
      this.$nextTick(() => {
        const container = this.$refs.chatbox;
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      });
    },
    showImage(fileUrl) {
      this.imageSrc = this.baseUrl + fileUrl;
      this.imagePreviewDialog = true;
    },
    closeModal() {
      this.$v.$reset();
      this.dispatchLocation = null;
      this.dispatchPic = null;
      this.dispatchNote = "";
      this.dialog = false;
      this.imagePreviewDialog = false;
    },
    dispatch() {
      this.dialog = true;
    },
    resolved() {
      Swal.fire({
        icon: "warning",
        title: "Resolved",
        text: "Are you sure want to resolve this ticket?",
        showCancelButton: true,
        showConfirmButton: true,
        allowEscapeKey: false,
        allowOutsideClick: false,
      }).then((result) => {
        if (result.isConfirmed) {
          this.postResolved();
        }
      });
    },
    resume() {
      Swal.fire({
        icon: "warning",
        title: "Resume",
        text: "Are you sure want to resume this ticket?",
        showCancelButton: true,
        showConfirmButton: true,
        allowEscapeKey: false,
        allowOutsideClick: false,
      }).then((result) => {
        if (result.isConfirmed) {
          this.postResume();
        }
      });
    },
    async postResume() {
      this.loading = true;
      const res = await ticketService.ticketResume(this.dataClick.id);
      if (res.data.status === 200) {
        this.dataClick = res.data.data;
        this.getTimeline(res.data.data.id);
        this.successPopup(res.data.message);
      } else {
        this.errorPopup(res.data.message);
      }
      this.loading = false;
    },
    pending() {
      Swal.fire({
        icon: "warning",
        title: "Pending",
        text: "Are you sure want to pending this ticket?",
        showCancelButton: true,
        showConfirmButton: true,
        allowEscapeKey: false,
        allowOutsideClick: false,
      }).then((result) => {
        if (result.isConfirmed) {
          this.postPending();
        }
      });
    },
    async postPending() {
      this.loading = true;
      const res = await ticketService.ticketPending(this.dataClick.id);
      if (res.data.status === 200) {
        this.dataClick = res.data.data;
        this.getTimeline(res.data.data.id);
        this.successPopup(res.data.message);
      } else {
        this.errorPopup(res.data.message);
      }
      this.loading = false;
    },
    async postResolved() {
      this.loading = true;
      const res = await ticketService.ticketResolved(this.dataClick.id);
      if (res.data.status === 200) {
        this.dataClick = res.data.data;
        this.getTimeline(res.data.data.id);
        this.successPopup(res.data.message);
      } else {
        this.errorPopup(res.data.message);
      }
      this.loading = false;
    },
    formatDate(x) {
      return moment(x).format("DD-MM-YYYY");
    },
    formatDateTime(x) {
      return moment(x).format("HH:mm DD-MM-YYYY");
    },
    async getLoc() {
      const res = await ticketService.getLocation();
      const data = res.data.data;
      this.dataLoc = data.map((project) => ({
        value: project.value,
        text: project.label,
      }));
    },
    async getTimeline(id) {
      const res = await ticketService.getTImeline(id);
      this.timelineEvents = res.data.data;
    },
    async getChat(id) {
      const res = await ticketService.getChat(id);
      this.dataChat = res.data.data;
      this.scrollChatbox();
    },
    async getTicketLatestDispatch(ticketId) {
      const param = { ticketId };
      const res = await ticketService.ticketGetDispatch(param);
      this.ticketDispatch = res.data.data;
    },
    goBack() {
      this.$router.go(-1);
    },
    deleteImage() {
      this.$refs.uploader.value = "";
      this.imgUpload = null;
      this.selectedFile1 = null;
      this.isSelecting = false;
    },
    successPopup(val) {
      Swal.fire({
        title: "Success",
        text: val,
        icon: "success",
        button: false,
        timer: 2000,
      });
    },
    errorPopup(val) {
      Swal.fire({
        title: "Failed",
        text: val,
        icon: "error",
        button: false,
        timer: 2000,
      });
    },
    async sendMessage() {
      if (this.message.trim() !== "") {
        const param = {
          content: this.message,
          ticketId: this.dataClick.id,
        };
        const res = await ticketService.postChat(param);

        if (res.data.status === 200) {
          // Auto-update status ke INPROGRESS jika masih ASSIGNED atau SUBMITTED
          if (this.dataClick.statusId === 'ASSIGNED' || this.dataClick.statusId === 'SUBMITTED') {
            this.dataClick.statusId = 'INPROGRESS';
            this.dataClick.statusName = 'In Progress';
          }
          
          if (this.selectedFile1 !== null) {
            await this.uploadFile(res.data.data);
          } else {
            this.getTimeline(res.data.data.ticketId);
          }
          this.scrollChatbox();
        } else {
          this.errorPopup(res.data.message);
        }
        this.message = "";
      }
    },
    async uploadFile(data) {
      const par = new FormData();
      par.append("file", this.selectedFile1);
      const api = "ticket-chat/document/";

      hitAPI.post(`${api}${data.id}`, par).then((res) => {
        if (res.data.status === 200) {
          this.deleteImage();
          this.getTimeline(data.ticketId);
        } else {
          this.errorPopup(res.data.message);
        }
      });
    },
    onFileChanged(e) {
      const file = e.target.files[0];
      if (!file) return;

      if (file.size > 5000000) {
        this.errorPopup("File upload exceeds the 5MB limit!");
        return;
      }

      const allowedTypes = [
        "image/png", "image/jpeg", "image/jpg",
        "application/pdf", "application/zip", "application/x-zip-compressed",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation"
      ];

      if (allowedTypes.includes(file.type)) {
        this.imgUpload = URL.createObjectURL(file);
        this.selectedFile1 = file;
      } else {
        this.errorPopup("Unsupported File Type");
      }
    },
    onButtonClick() {
      this.isSelecting = true;
      window.addEventListener("focus", () => {
        this.isSelecting = false;
      }, { once: true });
      this.$refs.uploader.click();
    },
    getUserData() {
      const userData = JSON.parse(localStorage.getItem("dataUser"));
      this.isITLead = userData.roleId === "IT_LEAD" || userData.roleId === "SUPER";
    },
    downloadDoc(item) {
      const link = document.createElement("a");
      link.href = this.baseUrl + item.fileUrl + "?download=true";
      document.body.appendChild(link);
      link.click();
    },
  },
};
</script>

<style scoped>
.btn-action {
  color: white !important;
  background-color: #0172b9 !important;
  width: 100%;
}

.btn-pending {
  color: white !important;
  background-color: #ec323f !important;
  width: 100%;
}

.btn-chat {
  color: white !important;
  background-color: #0172b9 !important;
}

.container-left {
  display: flex;
  align-items: center;
}

.container-right {
  justify-content: right;
  align-items: center;
  text-align: right;
}

.icon-apps {
  cursor: pointer;
  width: 40px;
  height: 40px;
}

.rounded-circle {
  border-radius: 50%;
  width: 50px;
  height: 50px;
  min-width: 50px;
  min-height: 50px;
  background-color: white;
  box-shadow: 0px 0px 6px rgba(0, 0, 0, 0.1);
}

.chat-user-name-label {
  font-size: 14px;
  font-weight: 700;
  line-height: 20px;
}

.chat-timestamp-label {
  font-size: 12px;
  font-weight: 400;
  line-height: 16px;
}

.chat-content-text {
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
}

.required:after {
  content: " *";
  color: red;
}
</style>