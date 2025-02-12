import { LatLng } from "leaflet";
import "./style.scss";
import {
  MapContainer,
  Polygon,
  Polyline,
  Popup,
  TileLayer,
  Tooltip,
  useMapEvent,
  useMapEvents,
} from "react-leaflet";
import "./leaflet.scss";
import { useEffect, useState } from "react";
import Pencil from "./assets/pencil.svg";
import { getDistance } from "./functions";

function App() {
  const [currentPosition, setCurrentPosition] = useState<LatLng>(
    new LatLng(-2.9562390384905846, -59.92733001708985)
  );
  const [editMode, setEditMode] = useState<boolean>(false);
  const [editPoints, setEditPoints] = useState<LatLng[]>([]);
  const [createdPoints, setCreatedPoints] = useState<LatLng[][]>([]);
  const [hoverPoint, setHoverPoint] = useState<LatLng | null>(null);
  const [zoom, setZoom] = useState(13);
  const [willClosePoly, setWillClosePoly] = useState(false);

  const MapEvents = () => {
    const map = useMapEvents({
      click: (e) => {
        console.log(e.latlng);

        if (!editMode) {
          setCurrentPosition(new LatLng(e.latlng.lat, e.latlng.lng));
          map.setView(e.latlng, map.getZoom());
        } else {
          if (
            editPoints.length > 2 &&
            getDistance(
              e.latlng.lat,
              e.latlng.lng,
              editPoints[0].lat,
              editPoints[0].lng
            ) *
              zoom *
              0.01 <
              0.05
          ) {
            setCreatedPoints((current) => [
              ...current,
              [...editPoints, new LatLng(editPoints[0].lat, editPoints[0].lng)],
            ]);
            setEditPoints([]);
          } else {
            if (editPoints.length > 1) {
              console.log(
                "zoom:",
                zoom,
                "distancia:",
                getDistance(
                  e.latlng.lat,
                  e.latlng.lng,
                  editPoints[0].lat,
                  editPoints[0].lng
                ) *
                  zoom *
                  0.01
              );
            }
            setEditPoints((currentPoints) => [
              ...currentPoints,
              new LatLng(e.latlng.lat, e.latlng.lng),
            ]);
          }
        }
      },
      contextmenu: (e) => {
        if (editPoints.length > 0) {
          setEditPoints((currentPoints) => currentPoints.slice(0, -1));
        }
      },
      mousemove: (e) => {
        if (
          editPoints.length > 2 &&
          getDistance(
            e.latlng.lat,
            e.latlng.lng,
            editPoints[0].lat,
            editPoints[0].lng
          ) *
            zoom *
            0.01 <
            0.05
        ) {
          setWillClosePoly(true);
        } else {
          setWillClosePoly(false);
        }
        setHoverPoint(new LatLng(e.latlng.lat, e.latlng.lng));
      },
      zoom: (e) => {
        setZoom(map.getZoom());
      },
    });

    return null;
  };

  useEffect(() => {
    if (!editMode) {
      setEditPoints([]);
    }
  }, [editMode]);

  const createPoint = () => {
    setCreatedPoints((current) => [...current, editPoints]);
    setEditPoints([]);
  };

  const erasePoint = (index: number) => {
    setCreatedPoints((current) => current.filter((latLng, i) => i != index));
    setEditPoints([]);
    setEditMode(false);
  };

  return (
    <>
      <div className={`map-wrapper ${editMode && "editor"}`}>
        <MapContainer
          center={currentPosition}
          zoom={zoom}
          scrollWheelZoom={true}
          className="map-window"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
          {editMode && (
            <Polyline
              pathOptions={{
                color: willClosePoly ? "orange" : "red",
              }}
              positions={
                editPoints.length > 0 && hoverPoint
                  ? [...editPoints, hoverPoint]
                  : editPoints
              }
            />
          )}
          {createdPoints.length &&
            createdPoints.map((points, index) => (
              <Polygon
                pathOptions={{
                  color: "blue",
                }}
                positions={points}
              >
                <Popup>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.stopPropagation();
                      erasePoint(index);
                    }}
                  >
                    Apagar
                  </a>
                </Popup>
              </Polygon>
            ))}
          <MapEvents />
        </MapContainer>
        <div className="map-toolbar">
          <div
            className={editMode ? "edit active" : "edit"}
            onClick={() => {
              setEditMode(!editMode);
            }}
          >
            <img src={Pencil} alt="Modo editor" width={16} height={16} />
          </div>
          {editMode && editPoints.length > 1 && (
            <>
              <div className="save" onClick={createPoint}>
                Salvar
              </div>
              <div
                className="erase"
                onClick={() => {
                  setEditPoints([]);
                }}
              >
                Apagar
              </div>
            </>
          )}
          <div className="current-location">
            <span>{`X: ${currentPosition.lat} / Y: ${currentPosition.lng}`}</span>
          </div>
          {editPoints.length > 2 && hoverPoint != null && (
            <div className="distance">
              / Distância para fechar:{" "}
              {getDistance(
                hoverPoint.lat,
                hoverPoint.lng,
                editPoints[0].lat,
                editPoints[0].lng
              ) *
                zoom +
                zoom * 0.5}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default App;
