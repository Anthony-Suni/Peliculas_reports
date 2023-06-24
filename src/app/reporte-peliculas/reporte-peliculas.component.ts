import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-reporte-peliculas',
  templateUrl: './reporte-peliculas.component.html',
  styleUrls: ['./reporte-peliculas.component.css'],
})
export class ReportePeliculasComponent implements OnInit {
  peliculas: any[] = [];
  filtroAnio: number = 0;

  constructor(private http: HttpClient) {
    (<any>pdfMake).vfs = pdfFonts.pdfMake.vfs;
  }

  ngOnInit() {
    this.http.get<any[]>('./assets/peliculas.json').subscribe((data) => {
      this.peliculas = data;
    });
  }
  exportarExcel() {
    const data = this.peliculas.map(pelicula => [pelicula.titulo, pelicula.genero, pelicula.lanzamiento.toString()]);
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'Peliculas');
    const wbout = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
    saveAs(new Blob([wbout]), 'informe_peliculas.xlsx');
  }

  generarPDF() {
    // Aplicar filtros a las películas
    const peliculasFiltradas = this.peliculas.filter((pelicula) => {
      return (
        (!this.filtroAnio || pelicula.lanzamiento === this.filtroAnio)
      );
    });

    // Generar contenido del informe PDF con las películas filtradas
    const contenido = [
      { text: 'Informe de Películas', style: 'header' },
      { text: '\n\n' },
      {
        table: {
          headerRows: 1,
          widths: ['*', '*', '*'],
          body: [
            ['Título', 'Género', 'Año de lanzamiento'],
            ...peliculasFiltradas.map((pelicula) => [
              pelicula.titulo,
              pelicula.genero,
              pelicula.lanzamiento.toString(),
            ]),
          ],
        },
      },
    ];

    const estilos = {
      header: {
        fontSize: 32,
        bold: true,
        alignment: 'center',
        color: '#3366ff',
        margin: [0, 0, 0, 20],
      },
      table: {
        fontSize: 16,
        margin: [0, 20, 0, 0],
      },
      tableHeader: {
        bold: true,
        fontSize: 18,
        color: '#ffffff',
        fillColor: '#3366ff',
      },
    };

    const documentDefinition = {
      content: contenido,
      defaultStyle: {
        fontSize: 16,
      },
      styles: estilos,
      background: [
        {
          canvas: [
            {
              type: 'rect',
              x: 0,
              y: 0,
              w: 595.28,
              h: 841.89,
              color: '#83F5A2',
            },
          ],
        },
      ],
    };

    (<any>pdfMake).createPdf(documentDefinition).open();
  }
}
