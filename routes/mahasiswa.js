const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs')
const connection = require('../config/database');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images')
    },
    filename: (req, file, cb) => {
        console.log(file)
        cb(null, Date.now() + path.extname(file.originalname))
    }
})

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(new Error('Jenis File Tidak Diizinkan'), false)
    }
};
const upload = multer({ storage: storage, fileFilter: fileFilter })


router.get('/', function(req, res) {
    connection.query('select a.nama, b.nama_jurusan as jurusan ' + 'from mahasiswa a join jurusan b' + ' on b.id_jurusan order by a.id_m desc', function(err, rows) {
        if (err) {
            return res.status(500).json({
                status: false,
                message: 'Server Failed',
                error: err
            })
        } else {
            return res.status(200).json({
                status: true,
                message: 'Data Mahasiswa',
                data: rows
            })
        }
    })
})

router.post('/store', upload.single("gambar"), [
    body('nama').notEmpty(),
    body('nrp').notEmpty(),
    body('id_jurusan').notEmpty(),

], (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
        return res.status(422).json({
            error: error.array()
        })
    }
    let Data = {
        nama: req.body.nama,
        nrp: req.body.nrp,
        id_jurusan: req.body.id_jurusan,
        gambar: req.file.filename
    }
    connection.query('insert into mahasiswa set ?', Data, function(err, rows) {
        if (err) {
            return res.status(500).json({
                status: false,
                message: 'Server Error',
                error: err
            })
        } else {
            return res.status(201).json({
                status: true,
                message: 'Success..!',
                data: rows[0]
            })
        }
    })
})

router.get('/(:id)', function(req, res) {
    let id = req.params.id;
    connection.query(`select * from mahasiswa where id_m = ${id}`, function(err, rows) {
        if (err) {
            return res.status(500).json({
                status: false,
                message: 'Server Error',
            })
        }
        if (rows.length <= 0) {
            return res.status(404).json({
                status: false,
                message: 'Not Found',
            })
        } else {
            return res.status(200).json({
                status: true,
                message: 'Data Mahasiswa',
                data: rows[0]
            })
        }
    })
})

router.patch('/update/:id', upload.single("gambar"), [
    body('nama').notEmpty(),
    body('nrp').notEmpty(),
    body('id_jurusan').notEmpty()
], (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
        return res.status(422).json({
            error: error.array()
        });
    }
    let id = req.params.id;
    let gambar = req.file ? req.file.filename : null;
    connection.query(`select * from mahasiswa where id_m = ${id}`, function(err, rows) {
        if (err) {
            return res.status(500).json({
                status: false,
                message: 'Server Error'
            })
        }
        if (rows.length <= 0) {
            return res.status(404).json({
                status: false,
                message: 'Not Found'
            })
        }
        const namaFileLama = rows[0].gambar;

        if (namaFileLama && gambar) {
            const pathFileLama = path.join(__dirname, '../public/images', namaFileLama);
            fs.unlinkSync(pathFileLama);
        }

        let Data = {
            nama: req.body.nama,
            nrp: req.body.nrp,
            id_jurusan: req.body.id_jurusan,
            gambar: gambar
        }
        connection.query(`update mahasiswa set ? where id_m = ${id}`, Data, function(err, rows) {
            if (err) {
                return res.status(500).json({
                    status: false,
                    message: 'Server Error'
                })
            } else {
                return res.status(200).json({
                    status: true,
                    message: 'Update Success..!'
                })
            }
        })

    })
})

router.delete('/delete/(:id)', function(req, res) {
    let id = req.params.id;

    connection.query(`select * from mahasiswa where id_m = ${id}`, function(err, rows) {
        if (err) {
            return res.status(500).json({
                status: false,
                message: 'Server Error'
            })
        }
        if (rows.length <= 0) {
            return res.status(404).json({
                status: false,
                message: 'Not Found'
            })
        }
        const namaFileLama = rows[0].gambar;

        if (namaFileLama && gambar) {
            const pathFileLama = path.join(__dirname, '../public/images', namaFileLama);
            fs.unlinkSync(pathFileLama);
        }
        connection.query(`delete from mahasiswa where id_m = ${id}`, function(err, rows) {
            if (err) {
                return res.status(500).json({
                    status: false,
                    message: 'Server Error'
                })
            } else {
                return res.status(200).json({
                    status: true,
                    message: 'Data Has been delete'
                })
            }
        })
    })
})

module.exports = router;