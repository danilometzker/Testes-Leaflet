import {
  MapContainer,
  Polygon,
  Polyline,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { useEffect, useMemo, useState } from "react";
import { LatLng, LatLngBounds } from "leaflet";
import {
  CloseOutlined,
  EditOutlined,
  MenuOutlined,
  PlusOutlined,
  PushpinOutlined,
} from "@ant-design/icons";
import { Button, Divider, Drawer, FloatButton, List } from "antd";
import "@ant-design/v5-patch-for-react-19";

import "./style.scss";
import "./leaflet.scss";
import { getDistance, uuidv4 } from "../functions";
import AreaDrawer from "./AreaDrawer";

export type AreaData = {
  id: string;
  name: string;
  points: LatLng[];
  color?: string | null | undefined;
};

function Map() {
  const [currentPosition, setCurrentPosition] = useState<LatLng>(
    new LatLng(-2.9562390384905846, -59.92733001708985)
  );
  const [zoom, _setZoom] = useState(13);
  const [locationsDrawer, toggleLocationsDrawer] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editPoints, setEditPoints] = useState<LatLng[]>([]);
  const [willClosePoly, setWillClosePoly] = useState(false);
  const [currentPoly, setCurrentPoly] = useState<string | null>(null);
  const [currentPolyDrawer, setCurrentPolyDrawer] = useState<string | null>(
    null
  );
  const [hoverPoint, setHoverPoint] = useState<LatLng | null>(null);
  const [mapObj, setMapObj] = useState<any>(null);

  const openLocationsDrawer = () => {
    toggleLocationsDrawer((previousState) => !previousState);
  };

  const toggleEditMode = () => {
    setEditMode((previousMode) => !previousMode);
  };

  const data: AreaData[] = JSON.parse(localStorage.getItem("areas") || "[]");

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
            ) < 0.03
          ) {
            let obj = {
              id: uuidv4(),
              name: "Área sem nome",
              points: [
                ...editPoints,
                new LatLng(editPoints[0].lat, editPoints[0].lng),
              ],
            };
            localStorage.setItem("areas", JSON.stringify([...data, obj]));
            setEditPoints([]);
            setEditMode(false);
          } else {
            setEditPoints((currentPoints) => [
              ...currentPoints,
              new LatLng(e.latlng.lat, e.latlng.lng),
            ]);
          }
        }
      },
      contextmenu: (_e) => {
        if (editPoints.length > 0) {
          setEditPoints((currentPoints) => currentPoints.slice(0, -1));
        } else {
          setEditMode(false);
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
          ) < 0.03
        ) {
          setWillClosePoly(true);
        } else {
          setWillClosePoly(false);
        }
        setHoverPoint(new LatLng(e.latlng.lat, e.latlng.lng));
      },
      zoom: (_e) => {
        // if (zoom > map.getZoom()) {
        //   setCurrentPoly(null);
        // }
        // setZoom(map.getZoom());
      },
    });

    return null;
  };

  useEffect(() => {
    if (!editMode) {
      setEditPoints([]);
    } else {
      setCurrentPoly(null);
    }
  }, [editMode]);

  const Polygons = useMemo(
    () => () => {
      const map = useMap();

      // const handler = ;

      return (
        <>
          {data.length &&
            data.map((item, _index) => (
              <Polygon
                key={item.id}
                pathOptions={{
                  color: item.color ? item.color : "blue",
                }}
                positions={item.points}
                eventHandlers={useMemo(
                  () => ({
                    click(e: any) {
                      setCurrentPoly(item.id);
                      setEditPoints([]);
                      setEditMode(false);
                      map.fitBounds(e.target._bounds);
                    },
                  }),
                  [map]
                )}
              ></Polygon>
            ))}
        </>
      );
    },
    [data]
  );

  return (
    <div className={`map-wrapper ${editMode && "editor"}`}>
      <MapContainer
        center={currentPosition}
        zoom={zoom}
        scrollWheelZoom={true}
        className="map-window"
        attributionControl={false}
        boundsOptions={{ padding: [150, 150] }}
        ref={setMapObj}
      >
        <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
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
        <Polygons />
        <MapEvents />

        <Drawer
          title="Mapa"
          onClose={() => openLocationsDrawer()}
          open={locationsDrawer}
        >
          <Divider orientation="left">Áreas cadastrados</Divider>
          <List
            size="small"
            bordered
            dataSource={data}
            locale={{ emptyText: "Nenhuma área cadastrada." }}
            renderItem={(item: AreaData) => (
              <List.Item className="list-item-space-between" key={item.id}>
                <List.Item.Meta description={item.name} />
                <Button
                  onClick={() => {
                    const bounds = new LatLngBounds(item.points);
                    mapObj.fitBounds(bounds);
                    setCurrentPoly(item.id);
                    openLocationsDrawer();
                  }}
                >
                  <PushpinOutlined />
                </Button>
              </List.Item>
            )}
          />
        </Drawer>

        <AreaDrawer
          area={currentPolyDrawer}
          onClose={() => {
            setCurrentPolyDrawer(null);
          }}
        />
      </MapContainer>

      {currentPoly && (
        <>
          <FloatButton
            icon={<EditOutlined />}
            type="default"
            tooltip="Editar dados da área"
            onClick={(e) => {
              e.stopPropagation();
              setCurrentPolyDrawer(currentPoly);
            }}
            className={`add-area-button`}
            style={{
              insetInlineEnd: 48,
              transform: "translateY(-54px)",
            }}
          />
          <FloatButton
            icon={<CloseOutlined />}
            tooltip="Cancelar"
            type="default"
            onClick={(e) => {
              e.stopPropagation();
              setCurrentPoly(null);
            }}
            className={`add-area-button`}
            style={{
              insetInlineEnd: 48,
              transform: "translateY(-108px)",
            }}
          />
        </>
      )}

      <FloatButton
        icon={!editMode ? <PlusOutlined /> : <CloseOutlined />}
        type="default"
        tooltip="Criar nova área"
        onClick={(e) => {
          e.stopPropagation();
          toggleEditMode();
        }}
        className={`add-area-button ${editMode && "cancel-button"}`}
        style={{
          insetInlineEnd: 102,
        }}
      />

      <FloatButton
        icon={<MenuOutlined />}
        type="primary"
        onClick={(e) => {
          e.stopPropagation();
          openLocationsDrawer();
        }}
        style={{
          insetInlineEnd: 48,
        }}
      />
    </div>
  );
}

export default Map;
