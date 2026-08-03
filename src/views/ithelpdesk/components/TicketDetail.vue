<template>
  <div>
    <v-card class="pa-4" v-if="dataClick.id">
      <v-row>
        <v-col cols="8">
          <v-row align="center" justify="center">
            <v-col class="container-left">
              <v-btn icon class="rounded-circle" @click="goBack">
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
              <span style="font-weight: bold; color: #101010">{{ dataClick.title }}</span>
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
                    <v-card-text class="pa-4" :class="item.userId == dataClick.userId ? 'text-right' : ''">
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
                            v-if="item.document != null && (item.document.fileType == 'application/msword' || item.document.fileType == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')"
                            @click="downloadDoc(item)">
                            <v-icon>{{ icons.mdiFileWordBox }}</v-icon>
                            Download File
                          </v-btn>
                          <v-btn outlined depressed small
                            v-if="item.document != null && (item.document.fileType == 'application/vnd.ms-excel' || item.document.fileType == 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')"
                            @click="downloadDoc(item)">
                            <v-icon>{{ icons.mdiFileExcelBox }}</v-icon>
                            Download File
                          </v-btn>
                          <v-btn outlined depressed small
                            v-if="item.document != null && (item.document.fileType == 'application/vnd.ms-powerpoint' || item.document.fileType == 'application/vnd.openxmlformats-officedocument.presentationml.presentation')"
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
                  <v-icon style="float: right" v-if="imgUpload !== null" @click="deleteImage()">{{ icons.mdiDelete
                  }}</v-icon>
                  <img
                    v-if="selectedFile1 != null && (selectedFile1.type === 'image/png' || selectedFile1.type === 'image/jpeg' || selectedFile1.type === 'image/jpg')"
                    style="width: 20%" :src="imgUpload" />
                  <div
                    v-if="selectedFile1 != null && selectedFile1.type !== 'image/png' && selectedFile1.type !== 'image/jpeg' && selectedFile1.type !== 'image/jpg'"
                    class="py-4">
                    {{ selectedFile1.name }}
                  </div>
                </v-card-text>
                <v-card-actions v-if="dataClick.statusId !== 'RESOLVED'">
                  <v-text-field v-model="message" label="Type your message" @keydown.enter="sendMessage"></v-text-field>
                  <v-icon @click="onButtonClick" style="cursor: pointer" color="#0172b9">{{ icons.mdiPaperclip
                  }}</v-icon>
                  <v-btn class="mx-4 btn-chat" @click="sendMessage" :disabled="!message.trim()">Send</v-btn>
                  <input ref="uploader" class="d-none" type="file"
                    accept="image/*, .pdf, .zip, .rar, .doc, .docx, .xls, .xlsx, .ppt, .pptx" @change="onFileChanged" />
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </v-col>

        <v-col cols="4">
          <v-btn v-if="dataClick.statusId === 'RESOLVED' && (dataClick.rating === '' || dataClick.rating === null)"
            @click="openFeedbackModal" class="btn-action mb-6" depressed>Review</v-btn>

          <div v-if="dataClick.statusId === 'RESOLVED' && dataClick.rating !== '' && dataClick.rating !== null">
            <span style="color: #101010">Review</span>
            <star-rating :rating="dataClick.rating" :show-rating="false" :read-only="true" :increment="1"></star-rating>
            <v-textarea outlined disabled auto-grow :value="dataClick.testimonial"></v-textarea>
          </div>

          <span style="color: #101010">Activity log</span>
          <v-timeline dense align="start">
            <v-timeline-item dot-color="pink" size="small" v-for="(event, id) in timelineEvents" :key="id">
              <div>
                <strong class="me-4">{{ event.statusName }}</strong><br />
                <div>
                  <strong>{{ formatDate(event.createdAt) }}</strong>
                  <div class="text-caption">{{ event.description }}</div>
                </div>
              </div>
            </v-timeline-item>
          </v-timeline>
        </v-col>
      </v-row>
    </v-card>

    <v-card v-else class="pa-4">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
      <span class="ml-2">Loading ticket details...</span>
    </v-card>

    <v-dialog v-model="dialog" width="600px">
      <v-card>
        <v-card-title>
          <v-row align="center">
            <v-col>
              <div style="font-size: 18px; line-height: 28px; font-weight: 600; color: #000000;">
                Attachments Image
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
          <img style="width: 100%" :src="isImage" />
        </v-card-text>
      </v-card>
    </v-dialog>

    <FeedbackFormModal :id="dataClick.id" :open="feedbackDialog" @close="closeFeedbackModal"></FeedbackFormModal>
  </div>
</template>

<script>
import Swal from "sweetalert2";
import moment from "moment";
import FeedbackFormModal from "./FeedbackFormModal.vue";
import { hitAPI } from "@/services/upload/uploadServices";
import ItHelpDeskService from "@/services/ithelpdesk/itHelpDeskServices";
import StarRating from "vue-star-rating";

const getTicket = ItHelpDeskService.build();

import {
  mdiCheck,
  mdiCheckAll,
  mdiChevronLeft,
  mdiPaperclip,
  mdiDelete,
  mdiClose,
  mdiFolderZip,
  mdiFilePdfBox,
  mdiFileWordBox,
  mdiFileExcelBox,
  mdiFilePowerpointBox,
} from "@mdi/js";

export default {
  components: {
    FeedbackFormModal,
    StarRating,
  },
  data() {
    return {
      dialog: false,
      isImage: "",
      feedbackDialog: false,
      icons: {
        mdiClose,
        mdiDelete,
        mdiPaperclip,
        mdiChevronLeft,
        mdiCheck,
        mdiCheckAll,
        mdiFolderZip,
        mdiFilePdfBox,
        mdiFileWordBox,
        mdiFileExcelBox,
        mdiFilePowerpointBox,
      },
      imgUpload: null,
      selectedFile1: null,
      message: "",
      timelineEvents: [],
      dataChat: [],
      dataClick: {},
      baseUrl: process.env.VUE_APP_PERTAGAS,
      timer: null,
    };
  },
  async mounted() {
    await this.loadTicketDetail();
    this.scrollChatbox();

    this.timer = setInterval(() => {
      if (this.dataClick.id) {
        this.getChat(this.$route.params.id);
      }
    }, 2000);
  },
  beforeDestroy() {
    clearInterval(this.timer);
  },
  methods: {
    async loadTicketDetail() {
      try {
        const ticketId = this.$route.params.id;

        const param = {
          keyword: null,
          startDate: null,
          endDate: null,
          catalog: null,
          status: null,
        };

        const res = await getTicket.getTicket(param);
        const data = res.data.data.content;

        const filter = data.filter((value) => value.id === ticketId);

        if (filter.length !== 0) {
          this.dataClick = filter[0];
          await this.getTimeline(ticketId);
          await this.getChat(ticketId);
        } else {
          this.errorPopup('Ticket not found');
          this.goBack();
        }
      } catch (error) {
        console.error('Error loading ticket:', error);
        this.errorPopup('Failed to load ticket details');
        this.goBack();
      }
    },
    closeModal() {
      this.dialog = false;
    },
    showImage(x) {
      this.dialog = true;
      this.isImage = this.baseUrl + x;
    },
    formatDate(x) {
      return moment(x).format("DD-MM-YYYY");
    },
    formatDateTime(x) {
      return moment(x).format("HH:mm DD-MM-YYYY");
    },
    openFeedbackModal() {
      this.feedbackDialog = true;
    },
    closeFeedbackModal(result) {
      this.feedbackDialog = false;
      if (result != null) {
        this.dataClick = result;
      }
    },
    scrollChatbox() {
      this.$nextTick(() => {
        const container = this.$refs.chatbox;
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      });
    },
    async sendMessage() {
      if (this.message.trim() !== "") {
        const param = {
          content: this.message,
          ticketId: this.$route.params.id,
        };
        const res = await getTicket.postChat(param);
        if (res.data.status === 200) {
          if (this.selectedFile1 !== null) {
            await this.uploadFile(res.data.data);
          } else {
            await this.getTimeline(res.data.data.ticketId);
            await this.getChat(res.data.data.ticketId);
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
      hitAPI.post(`${api}${data.id}`, par).then(async (res) => {
        if (res.data.status === 200) {
          this.deleteImage();
          await this.getTimeline(data.ticketId);
          await this.getChat(data.ticketId);
        } else {
          this.errorPopup(res.data.message);
        }
      });
    },
    async getTimeline(x) {
      const res = await getTicket.getTImeline(x);
      this.timelineEvents = res.data.data;
    },
    async getChat(x) {
      const res = await getTicket.getChat(x);
      this.dataChat = res.data.data;
      this.scrollChatbox();
    },
    goBack() {
      this.$router.push('/ithelpdesk/my-request');
    },
    deleteImage() {
      this.$refs.uploader.value = "";
      this.imgUpload = null;
      this.selectedFile1 = null;
    },
    successPopup(val) {
      Swal.fire({
        title: "Success",
        text: val,
        icon: "success",
        timer: 2000,
      });
    },
    errorPopup(val) {
      Swal.fire({
        title: "Failed",
        text: val,
        icon: "error",
        timer: 2000,
      });
    },
    onFileChanged(e) {
      if (e.target.files[0].size > 5000000) {
        this.errorPopup("File upload exceeds the 5MB limit!");
      } else if (
        e.target.files[0].type === "image/png" ||
        e.target.files[0].type === "image/jpeg" ||
        e.target.files[0].type === "image/jpg" ||
        e.target.files[0].type === "application/pdf" ||
        e.target.files[0].type === "application/zip" ||
        e.target.files[0].type === "application/x-zip-compressed" ||
        e.target.files[0].type === "application/msword" ||
        e.target.files[0].type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        e.target.files[0].type === "application/vnd.ms-excel" ||
        e.target.files[0].type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        e.target.files[0].type === "application/vnd.ms-powerpoint" ||
        e.target.files[0].type === "application/vnd.openxmlformats-officedocument.presentationml.presentation"
      ) {
        this.imgUpload = URL.createObjectURL(e.target.files[0]);
        this.selectedFile1 = e.target.files[0];
      } else {
        this.errorPopup("Unsupported File Type");
      }
    },
    onButtonClick() {
      this.$refs.uploader.click();
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
  background-color: rgb(1, 114, 185) !important;
  color: white;
  text-transform: none;
  width: 100%;
}

.btn-chat {
  background-color: rgb(1, 114, 185) !important;
  color: white;
  text-transform: none;
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
</style>