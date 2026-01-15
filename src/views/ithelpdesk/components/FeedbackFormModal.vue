<template>
    <v-row justify="center">
        <v-dialog v-model="isOpen" width="600">
            <v-card>
                <v-card-title>
                    <v-row align="center">
                        <v-col>
                            <div style="
                  font-size: 18px;
                  line-height: 28px;
                  font-weight: 600;
                  color: #000000;
                ">
                                Review
                            </div>
                        </v-col>
                        <v-col class="text-right">
                            <v-btn icon @click="close">
                                <v-icon color="black">
                                    {{ icons.mdiClose }}
                                </v-icon>
                            </v-btn>
                        </v-col>
                    </v-row>
                </v-card-title>
                <v-card-text>
                    <form @submit.prevent="submit">
                        <v-row>
                            <v-col cols="12">
                                <v-row align="center" justify="center">
                                    <v-col cols="6">
                                        <span style="font-weight: bold; font-size: 18px;">{{ ratingText[rating - 1]
                                            }}</span>
                                    </v-col>
                                    <v-col cols="6">
                                        <star-rating v-model="rating" :show-rating="false" class="mb-4"></star-rating>
                                    </v-col>
                                </v-row>

                                <label class="required">Note</label>
                                <v-textarea v-model.trim="$v.testimonial.$model"
                                    :error-messages="getErrors('testimonial', $v.testimonial)"
                                    @blur="$v.testimonial.$touch()" outlined
                                    placeholder="Write your note here"></v-textarea>

                                <v-btn class="btn-submit" @click="submit"> Send Review </v-btn>
                            </v-col>
                        </v-row>
                    </form>
                </v-card-text>
            </v-card>
        </v-dialog>
    </v-row>
</template>
<script>
import { required } from "vuelidate/lib/validators";
import { mdiClose, mdiFileDocumentOutline } from "@mdi/js";
import Swal from "sweetalert2";
import ItHelpDeskService from "@/services/ithelpdesk/itHelpDeskServices";
import { hitAPI } from "@/services/upload/uploadServices";
const getService = ItHelpDeskService.build();
import StarRating from 'vue-star-rating';

export default {
    components: {
        StarRating
    },
    data() {
        return {
            ratingText: [
                "Unacceptable service.",
                "Below-average service.",
                "Satisfactory service.",
                "Good service.",
                "Excellent service.",
            ],
            rating: 0,
            testimonial: "",
            result: null,

            icons: {
                mdiFileDocumentOutline,
                mdiClose,
            },
        };
    },
    validations: {
        testimonial: {
            required,
        },
    },
    props: {
        open: Boolean,
        id: String,
    },
    mounted() { },
    computed: {
        isOpen: {
            get() {
                return this.open;
            },
            set(value) {
                if (!value) {
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
                case "testimonial":
                    !model.required && errors.push("Note is required");
                    break;
                default:
                    break;
            }

            return errors;
        },
        async submit() {
            this.$v.$touch();
            if (
                !this.$v.testimonial.$invalid
            ) {
                const param = {
                    id: this.id,
                    rating: this.rating,
                    testimonial: this.testimonial,
                };
                const res = await getService.postFeedback(param);
                const status = res.data.status;
                if (status === 200) {
                    this.result = res.data.data;
                    this.successPopup(res.data.message);
                    this.close();
                } else {
                    this.errorPopup(res.data.message);
                    this.close();
                }
            }

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
        close() {
            this.$v.$reset();
            this.$emit("close", this.result);
            this.rating = 0;
            this.testimonial = "";
        },
    },
};
</script>
<style scope>
.btn-submit {
    color: white !important;
    background-color: #0172b9 !important;
    width: 100%;
}

.required:after {
    content: " *";
    color: red;
}
</style>