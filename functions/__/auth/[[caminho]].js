// /__/auth/* → SEU-PROJETO.firebaseapp.com/__/auth/* (veja cloudflare/proxy-firebase.js)
import { repassarParaFirebase } from '../../../cloudflare/proxy-firebase.js';

export const onRequest = (context) => repassarParaFirebase(context);
