// /__/firebase/* → SEU-PROJETO.firebaseapp.com/__/firebase/* (ex.: init.json do login)
import { repassarParaFirebase } from '../../../cloudflare/proxy-firebase.js';

export const onRequest = (context) => repassarParaFirebase(context);
