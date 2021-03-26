// ############################# GENERAL VALIDATIONS ###################################
export function validateEmail(email) {
    const re = /^\S+@\S+$/;
    return re.test(String(email).toLowerCase());
}

// ########################### NEW USER FORM VALIDATIONS ################################
export function validateNewUserForm(formData, errors) {
    if (!validateEmail(formData.email)) {
        errors.email.addError("Not a valid e-mail address!");
    }
    return errors;
}