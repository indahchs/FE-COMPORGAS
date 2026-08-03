import swall from "sweetalert2";

const Alert = {
  confirmation(callback, confirmationTitle = "", confirmationText = "") {
    swall
      .fire({
        icon: "question",
        title: confirmationTitle,
        text: confirmationText,
        showCancelButton: true,
        confirmButtonText: "Yes",
        cancelButtonText: "No",
        confirmButtonColor: "#4dbd73",
        cancelButtonColor: "#f86c6b",
        showLoaderOnConfirm: true,
        allowOutsideClick: false,
        reverseButtons: true,
      })
      .then((result) => {
        if (result.isConfirmed) {
          if (callback) callback();
        }
      });
  },

  confirmationV2(
    callback1,
    callback2,
    confirmationTitle = "",
    confirmationText = ""
  ) {
    swall
      .fire({
        icon: "question",
        title: confirmationTitle,
        text: confirmationText,
        showCancelButton: true,
        confirmButtonText: "Yes",
        cancelButtonText: "No",
        confirmButtonColor: "#4dbd73",
        cancelButtonColor: "#f86c6b",
        allowOutsideClick: false,
        reverseButtons: true,
        showLoaderOnConfirm: true,
        preConfirm: callback1,
      })
      .then((result) => {
        if (result.isConfirmed) {
          if (callback2) callback2();
        }
      });
  },

  confirmStatus(
    callback,
    confirmationIcon = "",
    confirmationTitle = "",
    confirmationText = ""
  ) {
    swall
      .fire({
        icon: confirmationIcon,
        title: confirmationTitle,
        text: confirmationText,
        allowOutsideClick: false,
      })
      .then((result) => {
        if (result.isConfirmed) {
          if (callback) callback();
        }
      });
  },

  error(
    callback,
    confirmationIcon = "",
    confirmationTitle = "",
    confirmationText = ""
  ) {
    swall
      .fire({
        icon: confirmationIcon,
        title: confirmationTitle,
        text: confirmationText,
        confirmButtonText: "Ok",
        allowOutsideClick: false,
      })
      .then((result) => {
        if (result.isConfirmed) {
          if (callback) callback();
        }
      });
  },
};

export default Alert;
