import React, { useRef } from 'react';
import { View, Button, Alert, StyleSheet, Dimensions } from 'react-native';
import { PieChart } from "react-native-chart-kit";
import { jsPDF } from 'jspdf';
import * as FileSystem from 'expo-file-system'; // Manejo de archivos
import * as Sharing from 'expo-sharing'; // Para compartir archivos
import { captureRef } from 'react-native-view-shot';

export default function GraficosGeneros({ dataGeneros }) {
  const chartRef = useRef(); // Referencia al gráfico
  const screenWidth = Dimensions.get("window").width;
  const chartWidth = screenWidth - screenWidth * 0.1; // Ancho ajustado según la pantalla
  const chartHeight = 300; // Altura del gráfico

  const generarPDF = async () => {
    try {
      // Capturar el gráfico como imagen
      const uri = await captureRef(chartRef, {
        format: "png",
        quality: 1,
        width: chartWidth,
        height: chartHeight,
      });

      // Crear una instancia de jsPDF
      const doc = new jsPDF();

      // Agregar título al PDF
      doc.text("Reporte de Géneros", 10, 10);

      // Leer la imagen capturada y agregarla al PDF
      const chartImage = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      doc.addImage(`data:image/png;base64,${chartImage}`, "PNG", 10, 20, 150, 110);

      // Agregar los datos al PDF
      dataGeneros.forEach((item, index) => {
        const { name, population } = item;
        doc.text(`${name}: ${population}`, 10, 140 + index * 10); // Ajustar posición para dejar espacio a la imagen
      });

      // Generar el PDF como base64
      const pdfBase64 = doc.output('datauristring').split(',')[1];

      // Definir la ruta temporal para el archivo PDF en el sistema de archivos del dispositivo
      const fileUri = `${FileSystem.documentDirectory}reporte_generos.pdf`;

      // Guardar el archivo PDF
      await FileSystem.writeAsStringAsync(fileUri, pdfBase64, {
        encoding: FileSystem.EncodingType.Base64
      });

      // Compartir el archivo PDF
      await Sharing.shareAsync(fileUri);
      
    } catch (error) {
      console.error("Error al generar o compartir el PDF: ", error);
      Alert.alert('Error', 'No se pudo generar o compartir el PDF.');
    }
  };

  return (
    <View style={styles.container}>
      <View ref={chartRef} collapsable={false} style={styles.chartContainer}>
        <PieChart
          data={dataGeneros}
          width={chartWidth}
          height={chartHeight}
          chartConfig={{
            backgroundColor: "#fff",  // Color de fondo
            backgroundGradientFrom: "#f0f0f0",  // Color inicial del gradiente
            backgroundGradientTo: "#f0f0f0",    // Color final del gradiente
            color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`,  // Cambia los colores del gráfico
          }}
          accessor={"population"}
          paddingLeft={45}
          backgroundColor={"transparent"}
          style={{
            borderRadius: 10
          }}
        />
      </View>

      <View style={styles.button}>
        {/* Botón para generar y compartir PDF */}
        <Button title="Generar y Compartir PDF" onPress={generarPDF} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 10,
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  button: {
    marginTop: 10,
  },
});
