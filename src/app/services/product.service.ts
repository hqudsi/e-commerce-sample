import { Injectable } from '@angular/core';
import { addDoc, collection, collectionData, doc, docData, Firestore, increment, serverTimestamp, setDoc, updateDoc } from '@angular/fire/firestore';
import { BehaviorSubject, Observable } from 'rxjs';
import { Storage } from '@capacitor/storage';

const CART_STORAGE_KEY = 'my_cart';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  cart = new BehaviorSubject({});
  productsCollection: any;
  cartKey = null;
  constructor(
    private firestore: Firestore
  ) {
    const notesRef = collection(this.firestore, 'products');
    this.productsCollection =  collectionData(notesRef, { idField: 'id' });
    this.loadCart();
  }

  getProducts(): Observable<any> {
    return this.productsCollection;
  }

  async loadCart() {
    const result = await Storage.get({ key: CART_STORAGE_KEY });
    if (result.value) {
      this.cartKey = result.value;
      const cartDocRef = doc(this.firestore, `carts/${this.cartKey}`);
      docData(cartDocRef, { idField: 'id' }).subscribe((cartData: any) => {
        delete cartData['lastUpdate'];
        console.log('cart changed: ', cartData);
        this.cart.next(cartData || {});
      });
    } else {
      const cartRef = collection(this.firestore, 'carts');
      const cartDoc = await addDoc(cartRef, {
        lastUpdate: serverTimestamp()
      });
      console.log('new cart: ', cartDoc.id);
      this.cartKey = cartDoc.id;
      await Storage.set({key: CART_STORAGE_KEY, value: this.cartKey});
    }

  }

  async addToCart(id) {
    const cartDocRef = doc(this.firestore, `carts/${this.cartKey}`);
    await updateDoc(cartDocRef, {
      [id]: increment(1),
      lastUpdate: serverTimestamp()
    });

    const productDocRef = doc(this.firestore, `products/${id}`);
    await updateDoc(productDocRef, {
      stock: increment(-1)
    });
  }

  async removeFromCart(id) {
    const cartDocRef = doc(this.firestore, `carts/${this.cartKey}`);
    await updateDoc(cartDocRef, {
      [id]: increment(-1),
      lastUpdate: serverTimestamp()
    });

    const productDocRef = doc(this.firestore, `products/${id}`);
    await updateDoc(productDocRef, {
      stock: increment(1)
    });
  }

  async checkoutCart() {
    const orderRef = collection(this.firestore, 'orders');
    await addDoc(orderRef, this.cart.value);
    const cartDocRef = doc(this.firestore, `carts/${this.cartKey}`);
    await setDoc(cartDocRef, {
      lastUpdate: serverTimestamp()
    });
  }

}
