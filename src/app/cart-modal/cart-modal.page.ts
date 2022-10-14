import { Component, OnInit } from '@angular/core';
import { ProductService } from '../services/product.service';
import { take } from 'rxjs/operators';
import { AlertController, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-cart-modal',
  templateUrl: './cart-modal.page.html',
  styleUrls: ['./cart-modal.page.scss'],
})
export class CartModalPage implements OnInit {
  products = [];

  constructor(
    private productService: ProductService,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController
  ) { }

  ngOnInit() {
    const cartItems = this.productService.cart.value;
    console.log('cart: ', cartItems);
    this.productService.getProducts().pipe(take(1))
    .subscribe((allProducts: Array<any>) => {
      // const filtered =  allProducts.filter(p => cartItems[p.id]);
      // console.log('filtered: ', filtered);
      // const mapped = filtered.map(product => {
      //   return {...product, count: cartItems[product.id]};
      // });
      // console.log('mapped: ', mapped);
      this.products = allProducts.filter(p => cartItems[p.id]).map(product => {
        return { ...product, count: cartItems[product.id] };
      });
    });
  }

  close() {
    this.modalCtrl.dismiss();
  }

  async checkout() {
    const alert = await this.alertCtrl.create({
      header: 'Success',
      message: 'Thanks for your order',
      buttons: ['Continue shopping']
    });

    await alert.present();

    this.productService.checkoutCart();
    this.modalCtrl.dismiss();
  }

}
