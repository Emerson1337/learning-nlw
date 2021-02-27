import nodemailer, { Transporter } from 'nodemailer';
import handlebars from 'handlebars';
import fs from 'fs';

class SendMailService {
    private client: Transporter;
    constructor() {
        nodemailer.createTestAccount().then(acccount => {
            const transporter = nodemailer.createTransport({
                host: acccount.smtp.host,
                port: acccount.smtp.port,
                secure: acccount.smtp.secure,
                auth: {
                    user: acccount.user,
                    pass: acccount.pass,
                },
            });

            this.client = transporter;
        });
    }


    async execute(to: string, subject: string, variables: object, path: string){
        
        const templateFileContent = fs.readFileSync(path).toString("utf-8")
        const mailTemplateParse = handlebars.compile(templateFileContent);
        const html = mailTemplateParse(variables);

        const message = await this.client.sendMail({
            to,
            subject,
            html,
            from: "NPS <no-reply@nps.com.br>"
        });

        console.log("Message sent:  %s", message.messageId);
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(message));
    }
}

export default new SendMailService(); 