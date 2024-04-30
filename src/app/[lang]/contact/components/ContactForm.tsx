'use client'
import React from 'react';
import styles from './contact.module.css'

interface ContactFormProps {
  // Define props if any
}

interface ContactFormState {
  fullName: string;
  emailAddress: string;
  phoneNumber: string;
  emailSubject: string;
  message: string;
}

class ContactForm extends React.Component<ContactFormProps, ContactFormState> {
  constructor(props: ContactFormProps) {
    super(props);
    this.state = {
      fullName: '',
      emailAddress: '',
      phoneNumber: '',
      emailSubject: '',
      message: ''
    };
  }

  handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    this.setState({ [e.target.name]: e.target.value } as Pick<ContactFormState, keyof ContactFormState>);
  }

  sendEmail = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent the default form submission behavior

    const { fullName, emailAddress, phoneNumber, emailSubject, message } = this.state;

    const encodedFullName = encodeURIComponent(fullName);
    const encodedEmailAddress = encodeURIComponent(emailAddress);
    const encodedPhoneNumber = encodeURIComponent(phoneNumber);
    const encodedEmailSubject = encodeURIComponent(emailSubject);
    const encodedMessage = encodeURIComponent(message);

    const mailtoLink = `mailto:${encodedEmailAddress}?subject=${encodedEmailSubject}&body=${encodedMessage}%0A%0AFrom: ${encodedFullName} <%20${encodedEmailAddress}>%0APhone: +${encodedPhoneNumber}`;

    window.location.href = mailtoLink;
  }

  render() {
    const { fullName, emailAddress, phoneNumber, emailSubject, message } = this.state;
    const spanStyle: any = {
        '--i': 1
    };
    const spanStyle2: any = {
        '--i': 5
    };
    const spanStyle3: any = {
        '--i': 7
    };
    const spanStyle4: any = {
        '--i': 9
    };
    return (
      <section className={styles.contact} id="contact">
        <h1 className={styles.heading}>Contact <span>Us</span><span className="animate scroll" style={spanStyle}></span></h1>
        <form id="contactForm" onSubmit={this.sendEmail}>
          <div className={styles.inputbox}>
            <div className={styles.inputfield}>
              <input type="text" name="fullName" placeholder="Full Name" value={fullName} onChange={this.handleChange} required />
              <span className={styles.focus}></span>
            </div>
            <div className={styles.inputfield}>
              <input type="text" name="emailAddress" placeholder="Email Address" value={emailAddress} onChange={this.handleChange} required />
              <span className={styles.focus}></span>
            </div>
          </div>
          <div className={styles.inputbox}>
            <div className={styles.inputfield}>
              <input type="number" name="phoneNumber" placeholder="Mobile Number" value={this.state.phoneNumber} onChange={this.handleChange} required />
              <span className={styles.focus}></span>
            </div>
            <div className={styles.inputfield}>
              <input type="text" name="emailSubject" placeholder="Email Subject" value={this.state.emailSubject} onChange={this.handleChange} required />
              <span className={styles.focus}></span>
            </div>
            <span className="animate scroll" style={spanStyle2}></span>
          </div>
          <div className={styles.textareafield}>
            <textarea name="message" cols={10} rows={10} placeholder="Your Message" value={this.state.message} onChange={this.handleChange} required></textarea>
            <span className={styles.focus}></span>
            <span className="animate scroll" style={spanStyle3}></span>
          </div>
          <div className={styles.btns}>
            <button type="submit" className={styles.btn}>Submit</button>
            <span className="animate scroll" style={spanStyle4}></span>
          </div>
        </form>
      </section>
    );
  }
}

export default ContactForm;
