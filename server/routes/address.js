import {Router} from 'express';
import addressCtrl from '../controllers/address.controller'

const router = Router();

router.get('/', addressCtrl.readAddressMethod);
router.get('/:addressId',addressCtrl.findAddressMethod);
router.post('/',addressCtrl.addAddressMethod);
router.put('/:addressId',addressCtrl.editAddressMethod);
router.delete('/:addressId',addressCtrl.deleteAddressMethod);

router.get('/search/:id',addressCtrl.AddressRest);

export default router;

